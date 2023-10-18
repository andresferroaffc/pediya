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
import { GroupService } from './group.service';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EditGroupDto, GroupDto } from '../shared/dto/group';
import { HttpResponse } from '../shared/dto';
import { menssageSuccessResponse } from '../messages';
import { Group } from '../shared/entity';

@Controller('group')
export class GroupController {
  constructor(private readonly groupProduct: GroupService) {}

  // Crear grupo
  @Post('create-Group')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async create(@Body() dto: GroupDto): Promise<HttpResponse<Group>> {
    const data = await this.groupProduct.create(dto);
    return { message: menssageSuccessResponse('grupo').post, data };
  }

  // Consultar un grupo
  @Get('find/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<Group>> {
    const data = await this.groupProduct.findOne(id);
    return { message: menssageSuccessResponse('grupo').getOne, data };
  }

  // Consultar todos los grupos
  @Get('all')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(): Promise<HttpResponse<Group[]>> {
    const data = await this.groupProduct.findAll();
    return { message: menssageSuccessResponse('grupos').get, data };
  }

  // Modificar grupo
  @Patch('update-group/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditGroupDto,
  ): Promise<HttpResponse<Group>> {
    const data = await this.groupProduct.update(id, dto);
    return { message: menssageSuccessResponse('grupo').put, data };
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
    const data = await this.groupProduct.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('grupos').get, data };
  }

  // Eliminar grupo
  @Delete('delete-group/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.groupProduct.delete(id);
    return { message: menssageSuccessResponse('grupo').delete, data };
  }
}
