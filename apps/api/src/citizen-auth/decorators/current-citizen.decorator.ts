import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentCitizen = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // This will be the object returned from CitizenJwtStrategy.validate
  },
);
