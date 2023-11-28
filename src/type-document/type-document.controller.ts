import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TypeDocumentService } from './type-document.service';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EditTypeDocumentDto, HttpResponse, TypeDocumentDto } from '../shared/dto';
import { TypeDocument } from '../shared/entity';
import { menssageSuccessResponse } from '../messages';

@Controller('type-document')
export class TypeDocumentController {
    constructor(private readonly serviceTypeDocument:TypeDocumentService) {}

  // Crear tipo de documento
  @Post('create-type-document')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Body() dto: TypeDocumentDto): Promise<HttpResponse<TypeDocument>> {
    const data = await this.serviceTypeDocument.create(dto);
    return { message: menssageSuccessResponse('tipo de documento').post, data };
  }

  // Consultar un tipo de documento
  @Get('find/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<TypeDocument>> {
    const data = await this.serviceTypeDocument.findOne(id);
    return { message: menssageSuccessResponse('tipo de documento').getOne, data };
  }

  // Consultar todos los tipos de documento
  @Get('all')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(): Promise<HttpResponse<TypeDocument[]>> {
    const data = await this.serviceTypeDocument.findAll();
    return { message: menssageSuccessResponse('tipos de documento').get, data };
  }

  // Modificar tipo de documento
  @Patch('update-type-document/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditTypeDocumentDto,
  ): Promise<HttpResponse<TypeDocument>> {
    const data = await this.serviceTypeDocument.update(id, dto);
    return { message: menssageSuccessResponse('tipo de documento').put, data };
  }

  // Consultar con paginacion
  @Get('paginate')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async paginate(
    @Query('sort') sort: string,
    @Query('order') order: string | number,
    @Query('page') page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    const data = await this.serviceTypeDocument.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('tipos de documento').get, data };
  }

  // Eliminar tipo de documento
  @Delete('delete-type-document/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.serviceTypeDocument.delete(id);
    return { message: menssageSuccessResponse('tipo de documento').delete, data };
  }
}
