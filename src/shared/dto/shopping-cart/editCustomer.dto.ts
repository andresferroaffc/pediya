import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class EditCustomerDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  customer: number;
}
