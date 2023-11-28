import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ParameterService } from './parameter.service';
import { RoleEnum } from '../common/enum';
import { Roles } from '../common/decorator';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EditParameterDto, HttpResponse } from '../shared/dto';
import { Parameter } from '../shared/entity';
import { menssageSuccessResponse } from '../messages';

@Controller('parameter')
export class ParameterController {
  constructor(private readonly serviceParameter: ParameterService) {}

  // Consultar parametros
  @Get('all')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(): Promise<HttpResponse<Parameter>> {
    const data = await this.serviceParameter.findAll();
    return {
      message: menssageSuccessResponse('parametros').get,
      data,
    };
  }

  // Modificar parametros
  @Patch('update')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Body() dto: EditParameterDto,
  ): Promise<HttpResponse<Parameter>> {
    const data = await this.serviceParameter.update(dto);
    return {
      message: menssageSuccessResponse('parametro').put,
      data,
    };
  }
}
