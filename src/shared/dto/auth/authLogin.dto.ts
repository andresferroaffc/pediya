import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
