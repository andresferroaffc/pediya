import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestPassworDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
