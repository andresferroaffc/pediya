import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SuccessAuth {
  @ApiPropertyOptional()
  @IsOptional()
  status?: number;
  @ApiPropertyOptional()
  @IsOptional()
  msg?: {
    email: string;
    expiresIn: string;
    access_token: string;
  };
}
