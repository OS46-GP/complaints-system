import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: CurrentUserPayload) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { recipientId: user.id },
          { recipientRole: user.role },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async unreadCount(user: CurrentUserPayload) {
    const count = await this.prisma.notification.count({
      where: {
        OR: [
          { recipientId: user.id },
          { recipientRole: user.role },
        ],
        readAt: null,
      },
    });
    return { count };
  }

  async markRead(user: CurrentUserPayload, id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    const isRecipient =
      notification.recipientId === user.id ||
      (!!notification.recipientRole &&
        notification.recipientRole === user.role);
    if (!isRecipient) {
      throw new ForbiddenException('You cannot access this notification');
    }
    if (notification.readAt) {
      return notification;
    }
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
}
