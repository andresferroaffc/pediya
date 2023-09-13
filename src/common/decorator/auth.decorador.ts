/*import { UseGuards, applyDecorators } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategy/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/strategy/roles.guard';
import { Roles } from './role.decorator';

// Decorador de permisos a las rutas
export function Auth(route:string) {
  return applyDecorators(
    ApiBearerAuth(),
    Roles(route),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}*/

