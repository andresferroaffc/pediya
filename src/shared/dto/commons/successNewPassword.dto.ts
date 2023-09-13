import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SuccessNewPassword {
  @ApiPropertyOptional()
  @IsOptional()
  data?: boolean;
}
