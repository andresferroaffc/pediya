import { Module } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ShoppingCart, User } from '../shared/entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingCart, User, Product])],
  providers: [ShoppingCartService],
  controllers: [ShoppingCartController],
})
export class ShoppingCartModule {}
