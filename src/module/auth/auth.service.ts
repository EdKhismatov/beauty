import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { decode, sign, verify } from 'jsonwebtoken';
import { CacheTime } from '../../cache/cache.constants';
import { cacheKey, cacheRateLimit, cacheRefreshToken } from '../../cache/cache.keys';
import { RedisService } from '../../cache/redis.service';
import { appConfig } from '../../config';
import { UserEntity } from '../../database/entities';
import { EmailService } from '../mailer/email.service';
import { UserService } from '../users/user.service';
import { JwtPayload, TokenPair } from './auth.types';
import {
  ChangePasswordDto,
  LoginDto,
  RequestPasswordResetDto,
  RestorePasswordDto,
  TokenDto,
  UserCreateDto,
} from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    @Inject('MAIL_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  // Регистрация пользователя
  async register(dto: UserCreateDto) {
    const domain = dto.email.split('@')[1];
    const isBad = await this.redisService.get(`bad_domain:${domain}`);
    if (isBad) {
      throw new BadRequestException('Использование временных доменов запрещено!');
    }

    const rounds = 10;
    const hashedPassword = await hash(dto.password, rounds);
    const token = randomBytes(32).toString('hex');
    const url = `http://localhost:${appConfig.port}/auth/verify?token=${token}`;

    // 2. Ищем существующего юзера
    const userPresence = await this.userService.findOneByEmail(dto.email);

    if (userPresence) {
      if (userPresence.isVerified) {
        throw new ConflictException('A user with this login already exists.');
      }

      await userPresence.update({
        name: dto.name,
        password: hashedPassword,
        verificationToken: token,
      });

      try {
        this.rabbitClient.emit('send_welcome_email', { email: userPresence.email, url });
        this.logger.log(`Письмо повторно отправлено в RabbitMQ для ${dto.email}`);
      } catch (error) {
        this.logger.error(`Ошибка отправки письма`, error.message);
      }

      const { password, ...result } = userPresence.get({ plain: true });
      return result;
    }
    // новый юзер
    try {
      const newUser = {
        ...dto,
        password: hashedPassword,
        verificationToken: token,
      };
      const user = await this.userService.register({ ...newUser });

      const { password, ...result } = user.get({ plain: true });

      this.logger.log(`Регистрация нового пользователя ${dto.email}`);

      try {
        this.rabbitClient.emit('send_welcome_email', { email: user.email, url });
        this.logger.log(`Письмо отправлено в RabbitMQ`);
      } catch (error) {
        this.logger.error(`Ошибка отправки письма`, error.message);
      }

      return result;
    } catch (error) {
      // 5. Страховка от race condition
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('A user with this login already exists.');
      }
      throw error;
    }
  }

  private logAttempt = (success: boolean, result: string, ip: string, email: string) => {
    const payload = {
      email,
      ip,
      success,
      result,
    };
    return this.rabbitClient.emit('log_auth_attempt', payload);
  };

  // авторизация по логину и паролю
  async login(dto: LoginDto, IpAddress: string) {
    const user = await this.userService.findOneByEmail(dto.email);

    if (!user) {
      this.logAttempt(false, 'Пользователь не существует', IpAddress, dto.email);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const equals = await compare(dto.password, user.password);
    if (!equals) {
      this.logAttempt(false, 'Неверный пароль', IpAddress, dto.email);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      const token = randomBytes(32).toString('hex');
      const url = `http://localhost:${appConfig.port}/auth/verify?token=${token}`;
      try {
        await this.emailService.sendWelcomeEmail(user.email, url);
        await user.update({ verificationToken: token });
        this.logger.log(`Повторное письмо отправлено на ${user.email}`);
      } catch (e) {
        this.logger.error(`Не удалось отправить повторное письмо: ${e.message}`);
      }
      this.logAttempt(false, 'Почта не подтверждена', IpAddress, dto.email);
      throw new UnauthorizedException('Почта не подтверждена');
    }

    await user.update({ lastLoginAt: new Date() });
    const tokens = await this.upsertTokenPair(user);
    this.logAttempt(true, 'Успешный вход', IpAddress, dto.email);
    await this.redisService.set(
      cacheRefreshToken(user.id, tokens.refreshToken),
      { id: user.id },
      { EX: CacheTime.day7 },
    );

    this.logger.log(`refresh токен записан в базу`);
    this.logger.log(`Пользователь найден ${dto.email}`);

    return tokens;
  }

  // логаут
  async logout(refreshToken: string) {
    const payload = this.decode(refreshToken);
    await this.redisService.delete(cacheRefreshToken(payload.id, refreshToken));
  }

  // профиль
  async profile(id: string) {
    const user = await this.userService.getById(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user.get({ plain: true });
    this.logger.log(`Профиль по id найден`);
    return result;
  }

  // refresh
  async refresh(refreshtoken: TokenDto) {
    const payload = this.decode(refreshtoken.token);
    const cachekey = cacheRefreshToken(payload.id, refreshtoken.token);

    const session = await this.redisService.get<{ id: string }>(cachekey);

    if (!session) {
      this.logger.warn(`Попытка использования невалидного Refresh токена`);
      throw new UnauthorizedException('Session expired or token reused');
    }

    await this.redisService.delete(cachekey);
    const user = await this.userService.getById(session.id);

    if (!user) {
      throw new UnauthorizedException('User is inactive or not found');
    }

    if (!user.active) {
      throw new UnauthorizedException('You are blocked');
    }

    const tokens = await this.upsertTokenPair(user);
    this.logger.log(`Токены обновлены`);

    await this.redisService.set(
      cacheRefreshToken(user.id, tokens.refreshToken),
      { id: user.id },
      { EX: CacheTime.day7 },
    );
    return tokens;
  }

  // подтверждение почты
  async confirms(token: string) {
    const user = await this.userService.findByToken(token);
    if (!user) {
      throw new BadRequestException('Ссылка недействительна или уже была использована');
    }

    await user.update({ isVerified: true, verificationToken: null });
    this.logger.log(`Email ${user.email} успешно верифицирован`);
    return { message: 'Почта подтверждена. Теперь вы можете войти в систему.' };
  }

  private async upsertTokenPair(user: UserEntity): Promise<TokenPair> {
    const { id } = user.get({ plain: true });

    const payload: JwtPayload = { id };

    const accessToken = sign(payload, appConfig.jwt.accessSecret, { expiresIn: '1h' });
    const refreshToken = sign(payload, appConfig.jwt.refreshSecret, { expiresIn: '1w' });

    return { accessToken, refreshToken };
  }

  public verify(token: string, type: 'access' | 'refresh'): boolean {
    const secrets = {
      access: appConfig.jwt.accessSecret,
      refresh: appConfig.jwt.refreshSecret,
    };

    try {
      verify(token, secrets[type]);
      return true;
    } catch (err) {
      return false;
    }
  }

  public decode(token: string): JwtPayload {
    const decoded = decode(token, { json: true });

    if (!decoded) {
      throw new UnauthorizedException();
    }

    return decoded as JwtPayload;
  }

  // изменение пароля
  async change(dto: ChangePasswordDto, id: string) {
    const user = await this.userService.getById(id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const equals = await compare(dto.currentPassword, user.password);

    if (!equals) {
      throw new UnauthorizedException("Password doesn't match");
    }

    // хешируем пароль
    const rounds = 10;
    user.password = await hash(dto.newPassword, rounds);
    await user.save();

    this.logger.log(`Пароль пользователя ${user.email} изменен`);
    return {
      mail: user.email,
      message: 'Password updated successfully',
    };
  }

  // Отправка кода для восстановления пароля
  async requestPasswordReset(body: RequestPasswordResetDto) {
    const throttleKey = cacheRateLimit(body.email);
    const isThrottled = await this.redisService.get(throttleKey);

    if (isThrottled) {
      this.logger.warn(`Частые запросы на восстановление: ${body.email}`);
      return { success: false, message: 'Попробуйте позже (не чаще раза в минуту)' };
    }

    const user = await this.userService.findOneByEmail(body.email);
    if (!user) {
      this.logger.log(`Попытка восстановления пароля для несуществующей почты: ${body.email}`);
      return { success: true };
    }
    const keys = ((parseInt(randomBytes(3).toString('hex'), 16) % 900000) + 100000).toString();
    const cacheKeys = cacheKey(keys);
    await this.redisService.set(cacheKeys, { email: body.email }, { EX: 180 });

    await this.redisService.set(throttleKey, '1', { EX: 60 });

    try {
      const payload = { email: user.email, keys };
      this.rabbitClient.emit('send_password_reset_email', payload);

      this.logger.log(`Письмо отправлено в RabbitMQ`);
    } catch (error) {
      this.logger.error(`Ошибка,письмо не отправлено`, error.message);
    }
    return { success: true };
  }

  // восстановление пароля с кодом подтверждения
  async restorePassword(body: RestorePasswordDto) {
    const confirmationKey = await this.redisService.get(cacheKey(body.keys));

    if (!confirmationKey) {
      this.logger.log(`Ключ неверный или истек`);
      throw new UnauthorizedException('Invalid or expired code');
    }

    if (confirmationKey.email !== body.email) {
      this.logger.log(`Попытка подмены почты! Ключ для ${confirmationKey.email} использован для ${body.email}`);
      throw new UnauthorizedException('Invalid code for this email');
    }

    const rounds = 10;
    const hashedPassword = await hash(body.newPassword, rounds);
    const affectedCount = await this.userService.updatePasswordByEmail(body.email, hashedPassword);

    if (affectedCount === 0) {
      throw new BadRequestException('Пользователь не найден');
    }

    await this.redisService.delete(cacheKey(body.keys));

    try {
      const payload = { email: body.email, message: 'Ваш пароль успешно изменен' };
      this.rabbitClient.emit('send_password_recovery_email', payload);

      this.logger.log(`Письмо отправлено в RabbitMQ`);
    } catch (error) {
      this.logger.log(`Ошибка,письмо не отправлено`, error.message);
    }
    return { success: true };
  }
}
