import {
  Body,
  Controller,
  Post,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { Roles, user } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import {
  EditStatusReferralDto,
  HttpResponse,
  ReferralDto,
} from '../shared/dto';
import { ReferralService } from './referral.service';
import { menssageSuccessResponse } from '../messages';

@Controller('referral')
export class ReferralController {
  constructor(private readonly serviceReferral: ReferralService) {}
  @Post('create-referral')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(
    @user('id') idUser: number,
    @user('role') role: string,
    @user('dropshipping') dropshipping: boolean,
    @Body() dto: ReferralDto,
  ): Promise<HttpResponse<Object>> {
    const data = await this.serviceReferral.create(
      idUser,
      role,
      dropshipping,
      dto,
    );
    return { message: menssageSuccessResponse('remision').post, data };
  }

  // Modificar estado de la remsion
  @Patch('update-status-referral/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditStatusReferralDto,
  ): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.updateStatusReferral(id, dto);
    return { message: menssageSuccessResponse('remision').put, data };
  }

  // Consultar una remison
  @Get('find/:id')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @user('id') idUser: number,
    @user('role') role: string,
  ): Promise<HttpResponse<object>> {
    const data = await this.serviceReferral.findOne(id, idUser, role);
    return { message: menssageSuccessResponse('remision').getOne, data };
  }
}
