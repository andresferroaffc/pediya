import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Pagination } from 'nestjs-typeorm-paginate';

export class HttpResponsePagination<T> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
  @ApiProperty()
  @IsNotEmpty()
  data: Pagination<T>;
}
