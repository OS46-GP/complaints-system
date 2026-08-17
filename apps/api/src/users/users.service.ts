import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

const BASE_SELECT = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  role: true,
  isBlocked: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private authorityFor(role: UserRole): UserRole[] {
    // Normal users' reset requests are handled by Admins and SuperAdmins.
    // Admin/SuperAdmin requests are handled by SuperAdmins only.
    if (role === UserRole.Official) {
      return [UserRole.Admin, UserRole.SuperAdmin];
    }
    return [UserRole.SuperAdmin];
  }

  async create(actor: CurrentUserPayload, data: CreateUserDto) {
    const targetRole = data.role || UserRole.Official;

    if (targetRole === UserRole.SuperAdmin) {
      throw new ForbiddenException(
        'SuperAdmin accounts cannot be created by any user',
      );
    }

    if (actor.role !== UserRole.SuperAdmin && targetRole !== UserRole.Official) {
      throw new ForbiddenException(
        'Only SuperAdmin can create Admin or SuperAdmin accounts',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    if (data.nationalId) {
      const nationalIdExists = await this.prisma.user.findUnique({
        where: { nationalId: data.nationalId },
      });
      if (nationalIdExists) {
        throw new ConflictException('National ID already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        username: data.username,
        fullName: data.fullName || null,
        email: data.email || null,
        nationalId: data.nationalId || null,
        password: hashedPassword,
        role: targetRole,
      },
      select: BASE_SELECT,
    });
  }

  async findAll(
    actor: CurrentUserPayload,
    filters?: { search?: string; role?: string },
  ) {
    const where: any = {};
    if (filters?.search) {
      where.username = { contains: filters.search };
    }
    if (filters?.role) {
      where.role = filters.role;
    }
    if (actor.role !== UserRole.SuperAdmin) {
      // Non-SuperAdmin actors must not see SuperAdmin accounts or themselves.
      where.AND = [
        { role: { not: UserRole.SuperAdmin } },
        { id: { not: actor.id } },
      ];
    }
    const users = await this.prisma.user.findMany({
      where,
      select: {
        ...BASE_SELECT,
        nationalId: true,
      },
    });
    return this.sanitizeList(actor, users);
  }

  async findById(actor: CurrentUserPayload, id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...BASE_SELECT,
        nationalId: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeOne(actor, user);
  }

  async update(
    actor: CurrentUserPayload,
    id: string,
    data: UpdateUserDto,
  ) {
    const target = await this.assertCanManage(actor, id);

    if (data.nationalId) {
      const nationalIdExists = await this.prisma.user.findUnique({
        where: { nationalId: data.nationalId },
      });
      if (nationalIdExists && nationalIdExists.id !== id) {
        throw new ConflictException('National ID already exists');
      }
    }

    const updateData: any = {};
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.role !== undefined && data.role !== null) {
      if (data.role === UserRole.SuperAdmin) {
        throw new ForbiddenException(
          'You cannot assign a user to the SuperAdmin role',
        );
      }
      if (
        actor.role !== UserRole.SuperAdmin &&
        data.role !== UserRole.Official
      ) {
        throw new ForbiddenException(
          'Only SuperAdmin can change a role to Admin or SuperAdmin',
        );
      }
      if (id === actor.id && data.role !== actor.role) {
        throw new ForbiddenException('You cannot change your own role');
      }
      updateData.role = data.role;
    }
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.nationalId !== undefined) {
      updateData.nationalId = data.nationalId;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        ...BASE_SELECT,
        nationalId: true,
      },
    });
    return this.sanitizeOne(actor, updated);
  }

  async remove(actor: CurrentUserPayload, id: string) {
    const target = await this.assertCanManage(actor, id);

    if (target.id === actor.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    if (target.role === UserRole.Admin && actor.role === UserRole.Admin) {
      throw new ForbiddenException(
        'Admins cannot delete other Admin accounts',
      );
    }
    if (target.role === UserRole.SuperAdmin) {
      const superAdmins = await this.prisma.user.count({
        where: { role: UserRole.SuperAdmin },
      });
      if (superAdmins <= 1) {
        throw new BadRequestException(
          'Cannot delete the last SuperAdmin account',
        );
      }
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async block(actor: CurrentUserPayload, id: string) {
    return this.setBlocked(actor, id, true);
  }

  async unblock(actor: CurrentUserPayload, id: string) {
    return this.setBlocked(actor, id, false);
  }

  private async setBlocked(
    actor: CurrentUserPayload,
    id: string,
    isBlocked: boolean,
  ) {
    const target = await this.assertCanManage(actor, id);

    if (target.id === actor.id) {
      throw new ForbiddenException('You cannot block your own account');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: {
        ...BASE_SELECT,
        nationalId: true,
      },
    });

    await this.prisma.notification.create({
      data: {
        recipientId: target.id,
        type: isBlocked ? 'ACCOUNT_BLOCKED' : 'ACCOUNT_UNBLOCKED',
        title: isBlocked ? 'تم حظر حسابك' : 'تم إلغاء حظر حسابك',
        body: isBlocked
          ? 'تم حظر حسابك من قبل الإدارة، ولا يمكنك تسجيل الدخول حتى إشعار آخر.'
          : 'تم إلغاء حظر حسابك، ويمكنك تسجيل الدخول مرة أخرى.',
      },
    });

    return this.sanitizeOne(actor, updated);
  }

  private async assertCanManage(actor: CurrentUserPayload, id: string) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    // A SuperAdmin must not manage another SuperAdmin account (only their own
    // profile; role changes on self are also disallowed below).
    if (target.role === UserRole.SuperAdmin && target.id !== actor.id) {
      throw new ForbiddenException(
        'SuperAdmin cannot manage another SuperAdmin account',
      );
    }
    if (
      actor.role !== UserRole.SuperAdmin &&
      target.role !== UserRole.Official
    ) {
      throw new ForbiddenException(
        'Only SuperAdmin can manage Admin or SuperAdmin accounts',
      );
    }
    return target;
  }

  private maskNationalId(nationalId: string | null) {
    if (!nationalId) return null;
    if (nationalId.length <= 4) return '****';
    return `****${nationalId.slice(-4)}`;
  }

  private sanitizeOne(
    actor: CurrentUserPayload,
    user: any,
  ) {
    if (actor.role === UserRole.SuperAdmin) {
      return user;
    }
    return { ...user, nationalId: this.maskNationalId(user.nationalId) };
  }

  private sanitizeList(
    actor: CurrentUserPayload,
    users: any[],
  ) {
    return users.map((user) => this.sanitizeOne(actor, user));
  }

  async findByNationalId(nationalId: string) {
    return this.prisma.user.findUnique({
      where: { nationalId },
    });
  }

  async requestPasswordReset(dto: PasswordResetRequestDto) {
    const user = await this.findByNationalId(dto.nationalId);
    if (!user) {
      throw new BadRequestException(
        'No account is associated with this national ID',
      );
    }

    const authorityRoles = this.authorityFor(user.role);

    const resetRequest = await this.prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        requestedBy: dto.nationalId,
        status: 'Pending',
      },
    });

    await this.prisma.notification.createMany({
      data: authorityRoles.map((role) => ({
        recipientRole: role,
        type: 'PASSWORD_RESET_REQUEST',
        title: 'طلب إعادة تعيين كلمة المرور',
        body: `المستخدم "${user.username}" طلب إعادة تعيين كلمة المرور الخاصة به.`,
        resourceId: resetRequest.id,
      })),
    });

    return {
      matched: true,
      username: user.username,
      requestId: resetRequest.id,
    };
  }

  async approvePasswordReset(
    actor: CurrentUserPayload,
    requestId: string,
  ) {
    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: { select: { id: true, username: true, role: true, nationalId: true } } },
    });
    if (!request) {
      throw new NotFoundException('Password reset request not found');
    }
    if (request.status !== 'Pending') {
      throw new BadRequestException('This request has already been resolved');
    }

    if (!this.authorityFor(request.user.role).includes(actor.role)) {
      throw new ForbiddenException(
        'You are not authorized to approve this password reset request',
      );
    }

    if (!request.user.nationalId) {
      throw new BadRequestException(
        'User has no national ID on file to use as the new password',
      );
    }

    const hashedPassword = await bcrypt.hash(request.user.nationalId, 10);
    await this.prisma.user.update({
      where: { id: request.user.id },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: { status: 'Approved', resolvedAt: new Date(), resolvedBy: actor.id },
    });

    await this.prisma.notification.create({
      data: {
        recipientId: request.user.id,
        type: 'PASSWORD_RESET',
        title: 'تم إعادة تعيين كلمة المرور',
        body: 'تمت إعادة تعيين كلمة المرور الخاصة بك من قبل الإدارة.',
      },
    });

    return { success: true };
  }

  async rejectPasswordReset(
    actor: CurrentUserPayload,
    requestId: string,
  ) {
    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: { select: { id: true, role: true } } },
    });
    if (!request) {
      throw new NotFoundException('Password reset request not found');
    }
    if (request.status !== 'Pending') {
      throw new BadRequestException('This request has already been resolved');
    }
    if (!this.authorityFor(request.user.role).includes(actor.role)) {
      throw new ForbiddenException(
        'You are not authorized to reject this password reset request',
      );
    }

    await this.prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: { status: 'Rejected', resolvedAt: new Date(), resolvedBy: actor.id },
    });

    return { success: true };
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByIdRaw(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...BASE_SELECT,
        nationalId: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
