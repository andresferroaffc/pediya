import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
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
  @IsOptional()
  stock: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
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
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;

  @ApiProperty()
  @IsEnum(TypeProduct)
  @IsNotEmpty()
  typeProduct: TypeProduct;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  discount: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  commission: number;
}
