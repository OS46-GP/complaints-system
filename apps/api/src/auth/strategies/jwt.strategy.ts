import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findByIdRaw(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.isBlocked) {
      throw new UnauthorizedException(
        'Your account has been blocked. Please contact the administration.',
      );
    }
    return user;
  }
}
