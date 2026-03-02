import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizedFastifyRequest } from '../app.types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../module/auth/auth.service';
import { UserService } from '../module/users/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (context.getType() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthorizedFastifyRequest>();

    const header = request.headers['authorization'];
    if (!header) {
      throw new UnauthorizedException();
    }

    const [, accessToken] = header.split(' ');
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    const valid = this.authService.verify(accessToken, 'access');
    if (!valid) {
      throw new UnauthorizedException();
    }

    const payload = this.authService.decode(accessToken);
    if (!payload) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.getById(payload.id);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.active) {
      throw new UnauthorizedException('You are blocked');
    }

    request.user = user;

    return true;
  }
}
