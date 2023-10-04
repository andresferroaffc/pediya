import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EditProductDto, HttpResponse, ProductDto } from '../shared/dto';
import { Product } from '../shared/entity';
import { menssageSuccessResponse } from '../messages';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly serviceProduct: ProductService) {}

  // Crear producto
  @Post('create-product')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Body() dto: ProductDto): Promise<HttpResponse<Product>> {
    const data = await this.serviceProduct.create(dto);
    return { message: menssageSuccessResponse('producto').post, data };
  }

  // Consultar un producto
  @Get('find/:id')
  @Roles(RoleEnum.Administrador,RoleEnum.Cliente,RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<Product>> {
    const data = await this.serviceProduct.findOne(id);
    return { message: menssageSuccessResponse('producto').getOne, data };
  }

  // Consultar todos los productos
  @Get('all')
  @Roles(RoleEnum.Administrador,RoleEnum.Cliente,RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(): Promise<HttpResponse<Product[]>> {
    const data = await this.serviceProduct.findAll();
    return { message: menssageSuccessResponse('productos').get, data };
  }

  // Modificar producto
  @Patch('update-product/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateproduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditProductDto,
  ): Promise<HttpResponse<Product>> {
    const data = await this.serviceProduct.update(id, dto);
    return { message: menssageSuccessResponse('producto').put, data };
  }

  // Consultar con paginacion
  @Get('paginate')
  @Roles(RoleEnum.Administrador,RoleEnum.Cliente,RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async paginate(
    @Query('sort') sort: string,
    @Query('order') order: string | number,
    @Query('page') page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    const data = await this.serviceProduct.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('productos').get, data };
  }
}
