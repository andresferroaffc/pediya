import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { RoleEnum } from '../../../common/enum';
import { TypePerson } from 'src/common/enum/type-person.enum';

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
  @IsNumber()
  @IsNotEmpty()
  typeDocument: number;

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
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  phone1: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  phone2: string;

  @ApiProperty()
  @IsEnum(RoleEnum)
  @IsNotEmpty()
  role: RoleEnum;

  @ApiProperty()
  @IsEnum(TypePerson)
  @IsNotEmpty()
  typePerson: TypePerson;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  departament_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
