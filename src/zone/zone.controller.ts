import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EditZoneDto, HttpResponse, ZoneDto } from '../shared/dto';
import { Zone } from '../shared/entity';
import { menssageSuccessResponse } from '../messages';

@Controller('zone')
export class ZoneController {
    constructor(private readonly serviceZone: ZoneService) {}

    // Crear zona
    @Post('create-zone')
    @Roles(RoleEnum.Administrador)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async create(@Body() dto: ZoneDto): Promise<HttpResponse<Zone>> {
      const data = await this.serviceZone.create(dto);
      return { message: menssageSuccessResponse('zona').post, data };
    }
  
    // Consultar un zona
    @Get('find/:id')
    @Roles(RoleEnum.Administrador,RoleEnum.Vendedor,RoleEnum.Cliente)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<HttpResponse<Zone>> {
      const data = await this.serviceZone.findOne(id);
      return { message: menssageSuccessResponse('zona').getOne, data };
    }
  
    // Consultar todos los grupos
    @Get('all')
    @Roles(RoleEnum.Administrador,RoleEnum.Vendedor,RoleEnum.Cliente)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async findAll(): Promise<HttpResponse<Zone[]>> {
      const data = await this.serviceZone.findAll();
      return { message: menssageSuccessResponse('grupos').get, data };
    }
  
    // Modificar zona
    @Patch('update-zone/:id')
    @Roles(RoleEnum.Administrador)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async updateProduct(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: EditZoneDto,
    ): Promise<HttpResponse<Zone>> {
      const data = await this.serviceZone.update(id, dto);
      return { message: menssageSuccessResponse('zona').put, data };
    }
  
    // Consultar con paginacion
    @Get('paginate')
    @Roles(RoleEnum.Administrador)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async paginate(
      @Query('sort') sort: string,
      @Query('order') order: string | number,
      @Query('page') page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
      limit = limit > 100 ? 100 : limit;
      const data = await this.serviceZone.paginate(sort, order, {
        page,
        limit,
      });
      return { message: menssageSuccessResponse('grupos').get, data };
    }
  
    // Eliminar zona
    @Delete('delete-zone/:id')
    @Roles(RoleEnum.Administrador)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    async deleteProduct(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<HttpResponse<boolean>> {
      const data = await this.serviceZone.delete(id);
      return { message: menssageSuccessResponse('zona').delete, data };
    }
}
