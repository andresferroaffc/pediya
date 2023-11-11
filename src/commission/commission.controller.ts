import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommissionService } from './commission.service';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommissionDto, EditCommissionDto, HttpResponse } from '../shared/dto';
import { Commission } from '../shared/entity';
import { menssageSuccessResponse } from '../messages';

@Controller('commission')
export class CommissionController {
  constructor(private readonly serviceCommission: CommissionService) {}

  // Crear comision
  @Post('create-commission')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Body() dto: CommissionDto): Promise<HttpResponse<Commission>> {
    const data = await this.serviceCommission.create(dto);
    return { message: menssageSuccessResponse('comision').post, data };
  }

  // Consultar un comision
  @Get('find/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<Commission>> {
    const data = await this.serviceCommission.findOne(id);
    return { message: menssageSuccessResponse('comision').getOne, data };
  }

  // Consultar todos los grupos
  @Get('all')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(): Promise<HttpResponse<Commission[]>> {
    const data = await this.serviceCommission.findAll();
    return { message: menssageSuccessResponse('grupos').get, data };
  }

  // Modificar comision
  @Patch('update-commission/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditCommissionDto,
  ): Promise<HttpResponse<Commission>> {
    const data = await this.serviceCommission.update(id, dto);
    return { message: menssageSuccessResponse('comision').put, data };
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
    const data = await this.serviceCommission.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('grupos').get, data };
  }

  // Eliminar comision
  @Delete('delete-commission/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.serviceCommission.delete(id);
    return { message: menssageSuccessResponse('comision').delete, data };
  }
}
