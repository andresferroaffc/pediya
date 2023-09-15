import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { menssageSuccessResponse } from '../messages';
import { RoleService } from './role.service';
import { HttpResponse } from '../shared/dto';
import { Role } from '../shared/entity';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Consultar todos los roles
  @Get('all')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async getAll(): Promise<HttpResponse<Role[]>> {
    const data = await this.roleService.findAll();
    return { message: menssageSuccessResponse('roles').get, data };
  }

  // Consultar un rol
  @Get('find/:role')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async getOne(@Param('role') role: string): Promise<HttpResponse<Role>> {
    const data = await this.roleService.findOne(role);
    return { message: menssageSuccessResponse('rol').getOne, data };
  }
}
