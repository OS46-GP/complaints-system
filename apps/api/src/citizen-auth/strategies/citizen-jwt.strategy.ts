import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CitizenJwtStrategy extends PassportStrategy(Strategy, 'citizen-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.CITIZEN_JWT_SECRET || 'fallback-citizen-secret',
    });
  }

  async validate(payload: any) {
    return { citizenId: payload.sub, email: payload.email };
  }
}
