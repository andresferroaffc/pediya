import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CommissionHistoryService } from './commission-history.service';
import { Roles, user } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommissionHistory } from '../shared/entity';
import { CommissionHistoryDto, HttpResponse } from '../shared/dto';
import { menssageSuccessResponse } from '../messages';

@Controller('commission-history')
export class CommissionHistoryController {
  constructor(
    private readonly commissionHistoryProduct: CommissionHistoryService,
  ) {}

  // Consultar un historial de comision
  @Get('find/:id')
  @Roles(RoleEnum.Administrador, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id') id: number,
    @user('id') idUser: number,
    @user('role') role: string,
  ): Promise<HttpResponse<CommissionHistory>> {
    const data = await this.commissionHistoryProduct.findOne(id, role, idUser);
    return {
      message: menssageSuccessResponse('historico de comision').getOne,
      data,
    };
  }

  // Consultar todos los historicos de comision
  @Get('all')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(
    @user('id') id: number,
    @user('role') role: string,
  ): Promise<HttpResponse<CommissionHistory[]>> {
    const data = await this.commissionHistoryProduct.findAll(id, role);
    return {
      message: menssageSuccessResponse('historicos de comision ').get,
      data,
    };
  }

  // Modificar esatdo del historico de comision
  @Patch('update/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CommissionHistoryDto,
  ): Promise<HttpResponse<CommissionHistory>> {
    const data = await this.commissionHistoryProduct.update(id, dto);
    return {
      message: menssageSuccessResponse('historico de comision').put,
      data,
    };
  }
}
