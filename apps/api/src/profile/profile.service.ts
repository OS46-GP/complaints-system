import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(user: CurrentUserPayload, data: UpdateProfileDto) {
    const updateData: { fullName?: string | null; email?: string | null } = {};
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName.trim() || null;
    }
    if (data.email !== undefined) {
      updateData.email = data.email.trim() || null;
    }

    return this.prisma.client.user.update({
      where: { id: user.id },
      data: updateData,
      select: PUBLIC_USER_SELECT,
    });
  }

  async changePassword(user: CurrentUserPayload, data: ChangePasswordDto) {
    const dbUser = await this.prisma.client.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    const valid = await bcrypt.compare(data.currentPassword, dbUser.password);
    if (!valid) {
      throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return { success: true };
  }
}
