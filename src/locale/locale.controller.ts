import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LocaleService } from './locale.service';
import { RoleEnum } from '../common/enum';
import { Roles } from '../common/decorator';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { menssageSuccessResponse } from '../messages';

@Controller('locale')
export class LocaleController {
  constructor(private readonly serviceLocale: LocaleService) {}

  // Consultar todos los departamentos
  @Get('states-all')
  @Roles(RoleEnum.Administrador, RoleEnum.Vendedor, RoleEnum.Cliente)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll() {
    const data = await this.serviceLocale.dataStates();
    return { message: menssageSuccessResponse('departamentos').get, data };
  }

  // Consultar todos las ciudades
  @Get('citys-all/:state_name')
  @Roles(RoleEnum.Administrador, RoleEnum.Vendedor, RoleEnum.Cliente)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findCityAll(@Param('state_name') state_name: string) {
    const data = await this.serviceLocale.dataCitys(state_name);
    return { message: menssageSuccessResponse('ciudades').get, data };
  }
}
