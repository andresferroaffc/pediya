import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RoleEnum, TypeDocument } from '../../../common/enum';

export class UserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  names: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  surnames: string;

  @ApiProperty()
  @IsEnum(TypeDocument)
  @IsNotEmpty()
  typeDocument: TypeDocument;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  phone: number;

  @ApiProperty()
  @IsEnum(RoleEnum)
  @IsNotEmpty()
  role: RoleEnum;
}
