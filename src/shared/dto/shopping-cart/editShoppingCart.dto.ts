import { PartialType } from '@nestjs/mapped-types';
import { ShoppingCartDto } from './shoppingCart.dto';
import { OmitType } from '@nestjs/swagger';

export class EditShoppingCartDto extends PartialType(
  OmitType(ShoppingCartDto, ['customer', 'product'] as const),
) {}
