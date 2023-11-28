import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ParameterDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  seller_commission: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name_enterprise: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
}
