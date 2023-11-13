import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TypeCommission } from '../../../common/enum';

export class CommissionDto {
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
  @IsBoolean()
  @IsOptional()
  is_general: boolean;

  @ApiProperty()
  @IsEnum(TypeCommission)
  @IsNotEmpty()
  type: TypeCommission;
}
