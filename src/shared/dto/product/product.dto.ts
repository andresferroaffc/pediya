import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TypeProduct } from 'src/common/enum';

export class ProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  inventory_group_id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  min_tock: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  inventoried: boolean;

  @ApiProperty()
  @IsEnum(TypeProduct)
  @IsNotEmpty()
  typeProduct: TypeProduct;
}
