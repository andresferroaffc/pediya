import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { Roles, user } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ShoppingCartDto } from '../shared/dto/shopping-cart';
import { ShoppingCart, User } from '../shared/entity';
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
  // Consultar todos los grupos
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
}
