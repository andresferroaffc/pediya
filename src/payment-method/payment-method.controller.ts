import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  EditPaymentMethodDto,
  HttpResponse,
  PaymentMethodDto,
} from '../shared/dto';
import { PaymentMethod } from '../shared/entity';
import { menssageSuccessResponse } from '../messages';

@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly servicePaymentMethod: PaymentMethodService) {}

  // Crear metodo de pago
  @Post('create-payment-method')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(
    @Body() dto: PaymentMethodDto,
  ): Promise<HttpResponse<PaymentMethod>> {
    const data = await this.servicePaymentMethod.create(dto);
    return { message: menssageSuccessResponse('metodo de pago').post, data };
  }

  // Consultar un metodo de pago
  @Get('find/:id')
  @Roles(RoleEnum.Administrador,RoleEnum.Vendedor,RoleEnum.Cliente)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<PaymentMethod>> {
    const data = await this.servicePaymentMethod.findOne(id);
    return { message: menssageSuccessResponse('metodo de pago').getOne, data };
  }

  // Consultar todos los metodos de pago
  @Get('all')
  @Roles(RoleEnum.Administrador,RoleEnum.Vendedor,RoleEnum.Cliente)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(): Promise<HttpResponse<PaymentMethod[]>> {
    const data = await this.servicePaymentMethod.findAll();
    return { message: menssageSuccessResponse('metodos de pago').get, data };
  }

  // Modificar metodo de pago
  @Patch('update-payment-method/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditPaymentMethodDto,
  ): Promise<HttpResponse<PaymentMethod>> {
    const data = await this.servicePaymentMethod.update(id, dto);
    return { message: menssageSuccessResponse('metodo de pago').put, data };
  }

  // Consultar con paginacion
  @Get('paginate')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async paginate(
    @Query('sort') sort: string,
    @Query('order') order: string | number,
    @Query('page') page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    const data = await this.servicePaymentMethod.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('metodos de pago').get, data };
  }

  // Eliminar metodo de pago
  @Delete('delete-payment-method/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.servicePaymentMethod.delete(id);
    return { message: menssageSuccessResponse('metodo de pago').delete, data };
  }
}
