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
    const notifications = await this.prisma.notification.findMany({
      where: {
        OR: [
          { recipientId: user.id },
          { recipientRole: user.role },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const resetRequestIds = notifications
      .filter(
        (n) =>
          n.type === 'PASSWORD_RESET_REQUEST' &&
          !!n.resourceId,
      )
      .map((n) => n.resourceId as string);

    const requests = resetRequestIds.length
      ? await this.prisma.passwordResetRequest.findMany({
          where: { id: { in: resetRequestIds } },
          select: { id: true, status: true },
        })
      : [];
    const statusByRequestId = new Map(
      requests.map((r) => [r.id, r.status]),
    );

    return notifications.map((n) => ({
      ...n,
      requestStatus:
        n.type === 'PASSWORD_RESET_REQUEST'
          ? (statusByRequestId.get(n.resourceId ?? '') ?? null)
          : null,
    }));
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
