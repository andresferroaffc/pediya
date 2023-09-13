import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorador user para tomar data del token
export const user = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const UserRequest = request.user;

    return data ? UserRequest && UserRequest[data] : UserRequest;
  },
);
