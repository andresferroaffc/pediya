import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Product } from 'src/shared/entity';
import { JoinTable, ManyToMany } from 'typeorm';

export class ReferralDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status: number;

  @ManyToMany(() => Product)
  @JoinTable()
  x: Product[];
}
