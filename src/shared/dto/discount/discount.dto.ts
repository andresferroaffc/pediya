import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TypeDiscount } from '../../../common/enum';

export class DiscountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  percentage: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  minimum_amount: number;

  @ApiProperty()
  @IsEnum(TypeDiscount)
  @IsNotEmpty()
  type: TypeDiscount;
}
