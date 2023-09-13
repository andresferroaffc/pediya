import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldpassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newpassword: string;
}
