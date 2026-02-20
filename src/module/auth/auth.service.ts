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
import { cacheRefreshToken } from '../../cache/cache.keys';
import { RedisService } from '../../cache/redis.service';
import { appConfig } from '../../config';
import { UserEntity } from '../../database/entities/user.entity';
import { EmailService } from '../mailer/email.service';
import { UserService } from '../users/user.service';
import { JwtPayload, TokenPair } from './auth.types';
import { LoginDto, UserCreateDto } from './dto';
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
      throw new BadRequestException('Использование временных почт запрещено!');
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

    const newUser: UserCreateDto = { ...dto, password: hashedPassword };

    const user = await this.userService.register(newUser as UserCreateDto);

    await user.update({ verificationToken: token });
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
      throw new UnauthorizedException();
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
        await user.update({ verificationToken: token });
        await this.emailService.sendWelcomeEmail(user.email, url);
        this.logger.log(`Повторное письмо отправлено на ${user.email}`);
      } catch (e) {
        this.logger.error(`Не удалось отправить повторное письмо: ${e.message}`);
      }
      this.logAttempt(false, 'Почта не подтверждена', IpAddress, dto.email);
      throw new UnauthorizedException('Почта не подтверждена');
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
}
