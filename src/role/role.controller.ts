import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { menssageSuccessResponse } from '../messages';
import { RoleService } from './role.service';
import {
  HttpResponse,
  HttpResponsePagination,
} from '../shared/dto';
import { Role } from '../shared/entity';
import { Roles } from 'src/common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from 'src/auth/strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/strategy/roles.guard';

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

  // Consultar por paginación
  @Get('paginate')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async paginate(
    @Query('sort') sort: string,
    @Query('order') order: string | number,
    @Query('page') page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<HttpResponsePagination<Role>> {
    limit = limit > 100 ? 100 : limit;
    const data = await this.roleService.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('categorias').get, data };
  }
}
