import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Product } from '../../../shared/entity';
import { JoinTable, ManyToMany } from 'typeorm';

export class ReferralDto {

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  payment_method_value: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  seller: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  payment_method: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  zone: number;

}
