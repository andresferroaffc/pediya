import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TypeCommissionHistory } from '../../../common/enum';

export class CommissionHistoryDto {
  @ApiProperty()
  @IsEnum(TypeCommissionHistory)
  @IsNotEmpty()
  status: TypeCommissionHistory;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;
}
