import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CitizenAuthService } from './citizen-auth.service';
import { CitizenAuthController } from './citizen-auth.controller';
import { CitizenJwtStrategy } from './strategies/citizen-jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.CITIZEN_JWT_SECRET || 'fallback-citizen-secret',
      signOptions: { expiresIn: '7d' }, // Citizens might stay logged in longer
    }),
  ],
  controllers: [CitizenAuthController],
  providers: [CitizenAuthService, CitizenJwtStrategy],
  exports: [CitizenAuthService],
})
export class CitizenAuthModule {}
