import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export interface CurrentUserPayload {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  nationalId: string | null;
  role: UserRole;
  createdAt: Date;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUserPayload;
  },
);
