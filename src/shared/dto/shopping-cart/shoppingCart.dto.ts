import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional} from 'class-validator';

export class ShoppingCartDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  count: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  product: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  customer: number;
}
