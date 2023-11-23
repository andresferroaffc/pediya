import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { Roles, user } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  EditCustomerDto,
  EditShoppingCartDto,
  ShoppingCartDto,
} from '../shared/dto/shopping-cart';
import { ShoppingCart } from '../shared/entity';
import { HttpResponse } from '../shared/dto';
import { menssageSuccessResponse } from '../messages';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly serviceShoppingCart: ShoppingCartService) {}

  // Agregar al carrito de compras
  @Post('add-shopping-cart')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async addShoppingCart(
    @user('id') id: number,
    @user('role') role: string,
    @Body() dto: ShoppingCartDto,
  ): Promise<HttpResponse<ShoppingCart>> {
    const data = await this.serviceShoppingCart.addShoppingCart(id, role, dto);
    return {
      message: menssageSuccessResponse('producto del carrito de compras').post,
      data,
    };
  }
  // Consultar todos los productos del carrito de compras del usuario
  @Get('all')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(
    @user('id') id: number,
    @user('role') role: string,
  ): Promise<HttpResponse<ShoppingCart[]>> {
    const data = await this.serviceShoppingCart.findAll(id, role);
    return {
      message: menssageSuccessResponse('productos del carrito de compras').get,
      data,
    };
  }

  // Consultar un producto del carrito de compras
  @Get('find/:id')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @user('id') idUser: number,
    @user('role') role: string,
  ): Promise<HttpResponse<ShoppingCart>> {
    const data = await this.serviceShoppingCart.findOne(id, idUser, role);
    return {
      message: menssageSuccessResponse('producto del carrito de compras')
        .getOne,
      data,
    };
  }

  // Modificar un producto del carrito de compras
  @Patch('update-shopping-cart/:id')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @user('id') idUser: number,
    @user('role') role: string,
    @Body() dto: EditShoppingCartDto,
  ): Promise<HttpResponse<ShoppingCart>> {
    const data = await this.serviceShoppingCart.update(id, idUser, role, dto);
    return {
      message: menssageSuccessResponse('producto del carrito de compras').put,
      data,
    };
  }

  // Eliminar un producto del carrito de compras
  @Delete('delete-shopping-cart/:id')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @user('id') idUser: number,
    @user('role') role: string,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.serviceShoppingCart.delete(id, idUser, role);
    return {
      message: menssageSuccessResponse('producto del carrito de compras')
        .delete,
      data,
    };
  }

  // Modificar cliente del carrito de compras
  @Patch('update-customer-cart')
  @Roles(RoleEnum.Administrador, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateCustomer(
    @user('id') id: number,
    @Body() dto: EditCustomerDto,
  ): Promise<HttpResponse<ShoppingCart[]>> {
    const data = await this.serviceShoppingCart.updateCustomer(id, dto);
    return {
      message: menssageSuccessResponse('producto del carrito de compras').put,
      data,
    };
  }
}
