import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.findAll(user);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.unreadCount(user);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markRead(user, id);
  }
}
