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
import { UserEntity } from '../../database/entities/user.entity';
import { EmailService } from '../mailer/email.service';
import { UserService } from '../users/user.service';
import { JwtPayload, TokenPair } from './auth.types';
import { ChangePasswordDto, LoginDto, RequestPasswordResetDto, RestorePasswordDto, UserCreateDto } from './dto';
import { TokenDto } from './dto/token.dto';

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

    const token = randomBytes(32).toString('hex');

    const userPresence = await this.userService.findOneByEmail(dto.email);

    if (userPresence) {
      this.logger.log(`Пользователь с логином ${dto.email} уже существует`);
      throw new ConflictException(`A user with this login already exists.`);
    }

    // хешируем пароль
    const rounds = 10;
    const rawPassword = dto.password;
    const hashedPassword = await hash(rawPassword, rounds);

    const newUser = { ...dto, password: hashedPassword, verificationToken: token };

    const user = await this.userService.register(newUser);

    const { password, ...result } = user.get({ plain: true });

    this.logger.log(`Регистрация нового пользователя ${dto.email}`);
    const url = `http://localhost:${appConfig.port}/auth/verify?token=${token}`;
    try {
      const payload = { email: user.email, url };
      this.rabbitClient.emit('send_welcome_email', payload);
      this.logger.log(`Письмо отправлено в RabbitMQ`);
    } catch (error) {
      this.logger.log(`Ошибка,письмо не отправлено`, error.message);
    }

    return result;
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
      this.logger.log(`Попытка входа с не подтвержденной почтой: ${user.email}`);
      // Здесь можно отправить письмо повторно, если нужно
      throw new UnauthorizedException('Пожалуйста, подтвердите вашу почту');
    }

    const tokens = await this.upsertTokenPair(user);
    this.logAttempt(true, 'Успешный вход', IpAddress, dto.email);
    await this.redisService.set(cacheRefreshToken(tokens.refreshToken), { id: user.id }, { EX: CacheTime.day8 });

    this.logger.log(`refresh токен записан в базу`);
    this.logger.log(`Пользователь найден ${dto.email}`);

    return tokens;
  }

  // логаут
  async logout(refreshToken: string) {
    return await this.redisService.delete(cacheRefreshToken(refreshToken));
  }

  // профиль
  async profile(id: string) {
    const user = await this.userService.getById(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user.get({ plain: true });
    if (!result.active) {
      this.logger.log(`Вы заблокированы`);
      throw new UnauthorizedException('You are blocked');
    }
    this.logger.log(`Профиль по id найден`);
    return result;
  }

  // refresh
  async refresh(refreshtoken: TokenDto) {
    const cacheKey = cacheRefreshToken(refreshtoken.token);

    const session = await this.redisService.get<{ id: string }>(cacheKey);

    if (!session) {
      this.logger.warn(`Попытка использования невалидного Refresh токена`);
      throw new UnauthorizedException('Session expired or token reused');
    }

    await this.redisService.delete(cacheRefreshToken(refreshtoken.token));
    const user = await this.userService.getById(session.id);

    if (!user) {
      throw new UnauthorizedException('User is inactive or not found');
    }
    const { password, ...result } = user.get({ plain: true });

    if (!result.active) {
      this.logger.log(`Вы заблокированы`);
      throw new UnauthorizedException('You are blocked');
    }

    const tokens = await this.upsertTokenPair(user);
    this.logger.log(`Токены обновлены`);

    await this.redisService.set(cacheRefreshToken(tokens.refreshToken), { id: user.id }, { EX: CacheTime.day8 });
    this.logger.log(`Обновленные токены занесены в базу`);
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
  async change(dto: ChangePasswordDto) {
    const user = await UserEntity.findOne({
      where: { email: dto.email },
    });
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

    this.logger.log(`Пароль пользователя ${dto.email} изменен`);
    return {
      mail: user.email,
      message: 'Password updated successfully',
    };
  }

  // Отправка кода для восстановления почты
  async requestPasswordReset(body: RequestPasswordResetDto) {
    const throttleKey = cacheRateLimit(body.email);
    const isThrottled = await this.redisService.get(throttleKey);

    if (isThrottled) {
      this.logger.warn(`Частые запросы на восстановление: ${body.email}`);
      return { success: false, message: 'Попробуйте позже (не чаще раза в минуту)' };
    }

    const user = await UserEntity.findOne({ where: { email: body.email } });
    if (!user) {
      this.logger.log(`Попытка восстановления пароля для несуществующей почты: ${body.email}`);
      return { success: true };
    }
    const keys = randomBytes(6).toString('hex');
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
    const [affectedCount] = await UserEntity.update({ password: hashedPassword }, { where: { email: body.email } });

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
