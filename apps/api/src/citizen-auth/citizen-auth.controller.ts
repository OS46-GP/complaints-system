import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CitizenAuthService } from './citizen-auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CitizenJwtAuthGuard } from './guards/citizen-jwt.guard';
import { CurrentCitizen } from './decorators/current-citizen.decorator';

@Controller('citizen-auth')
export class CitizenAuthController {
  constructor(private readonly citizenAuthService: CitizenAuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.citizenAuthService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.citizenAuthService.login(loginDto);
  }

  @UseGuards(CitizenJwtAuthGuard)
  @Get('me')
  getProfile(@CurrentCitizen() citizen: { citizenId: string; email: string }) {
    return this.citizenAuthService.getProfile(citizen.citizenId);
  }
}
