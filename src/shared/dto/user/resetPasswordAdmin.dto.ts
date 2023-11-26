import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newpassword: string;
}
