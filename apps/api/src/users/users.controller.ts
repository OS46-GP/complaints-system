import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @Post()
  create(
    @CurrentUser() actor: CurrentUserPayload,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(actor, createUserDto);
  }

  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @Get()
  findAll(
    @CurrentUser() actor: CurrentUserPayload,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(actor, { search, role });
  }

  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @Get(':id')
  findOne(
    @CurrentUser() actor: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.usersService.findById(actor, id);
  }

  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @Patch(':id')
  update(
    @CurrentUser() actor: CurrentUserPayload,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(actor, id, updateUserDto);
  }

  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @Delete(':id')
  remove(
    @CurrentUser() actor: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.usersService.remove(actor, id);
  }

  @Post('password-reset-request')
  requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.usersService.requestPasswordReset(dto);
  }

  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @Post('password-reset/:requestId/approve')
  approvePasswordReset(
    @CurrentUser() actor: CurrentUserPayload,
    @Param('requestId') requestId: string,
  ) {
    return this.usersService.approvePasswordReset(actor, requestId);
  }

  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @Post('password-reset/:requestId/reject')
  rejectPasswordReset(
    @CurrentUser() actor: CurrentUserPayload,
    @Param('requestId') requestId: string,
  ) {
    return this.usersService.rejectPasswordReset(actor, requestId);
  }
}
