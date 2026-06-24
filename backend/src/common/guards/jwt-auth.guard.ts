import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = AuthUser>(
    err: unknown,
    user: TUser | false | null | undefined,
  ): TUser {
    if (err || !user) {
      if (err instanceof Error) {
        throw err;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }
}
