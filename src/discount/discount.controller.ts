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
import { DiscountService } from './discount.service';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DiscountDto, EditDiscountDto, HttpResponse } from '../shared/dto';
import { Discount } from '../shared/entity';
import { menssageSuccessResponse } from '../messages';

@Controller('discount')
export class DiscountController {
  constructor(private readonly serviceDiscount: DiscountService) {}

  // Crear descuento
  @Post('create-discount')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Body() dto: DiscountDto): Promise<HttpResponse<Discount>> {
    const data = await this.serviceDiscount.create(dto);
    return { message: menssageSuccessResponse('descuento').post, data };
  }

  // Consultar un descuento
  @Get('find/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<Discount>> {
    const data = await this.serviceDiscount.findOne(id);
    return { message: menssageSuccessResponse('descuento').getOne, data };
  }

  // Consultar todos los descuentos
  @Get('all')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(): Promise<HttpResponse<Discount[]>> {
    const data = await this.serviceDiscount.findAll();
    return { message: menssageSuccessResponse('descuentos').get, data };
  }

  // Modificar descuento
  @Patch('update-discount/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditDiscountDto,
  ): Promise<HttpResponse<Discount>> {
    const data = await this.serviceDiscount.update(id, dto);
    return { message: menssageSuccessResponse('descuento').put, data };
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
    const data = await this.serviceDiscount.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('descuentos').get, data };
  }

  // Eliminar descuento
  @Delete('delete-discount/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.serviceDiscount.delete(id);
    return { message: menssageSuccessResponse('descuento').delete, data };
  }
}
