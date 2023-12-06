import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  EditUserDto,
  HttpResponse,
  ResetPasswordAdminDto,
  ResetPasswordDto,
  UserDto,
} from '../shared/dto';
import { UserService } from './user.service';
import { menssageSuccessResponse } from '../messages';
import { User } from '../shared/entity';
import { Roles, user } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly serviceUser: UserService) {}

  // Crear usuario
  @Post('create-user')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBearerAuth()
  async create(@Body() dto: UserDto): Promise<HttpResponse<User>> {
    const data = await this.serviceUser.create(dto);
    return { message: menssageSuccessResponse('usuario').post, data };
  }

  // Consultar un usuario
  @Get('find/:id')
  @Roles(RoleEnum.Administrador, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<User>> {
    const data = await this.serviceUser.findOne(id);
    return { message: menssageSuccessResponse('usuario').getOne, data };
  }

  // Consultar todos los usuarios
  @Get('all')
  @Roles(RoleEnum.Administrador, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll(): Promise<HttpResponse<User[]>> {
    const data = await this.serviceUser.findAll();
    return { message: menssageSuccessResponse('usuarios').get, data };
  }

  // Modificar usuario
  @Patch('update-user/:id')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @user('id') idUser: number,
    @user('role') role: string,
    @Body() dto: EditUserDto,
  ): Promise<HttpResponse<User>> {
    const data = await this.serviceUser.update(id, idUser, role, dto);
    return { message: menssageSuccessResponse('usuario').put, data };
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
    const data = await this.serviceUser.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('usuarios').get, data };
  }

  // Consultar perfil
  @Get('profile')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findPorfile(@user('id') id: number): Promise<HttpResponse<User>> {
    const data = await this.serviceUser.findProfile(id);
    return { message: menssageSuccessResponse('usuario').getOne, data };
  }

  // Cambiar contraseña
  @Patch('change-password')
  @Roles(RoleEnum.Administrador, RoleEnum.Cliente, RoleEnum.Vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async changePassword(
    @Body() dto: ResetPasswordDto,
    @user('id') id: number,
  ): Promise<HttpResponse<Object>> {
    const data = await this.serviceUser.changePassword(dto, id);
    return {
      message: menssageSuccessResponse('contraseña').put,
      data,
    };
  }

  // Asignar contraseña como administrador
  @Patch('reset-password/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordAdminDto,
  ): Promise<HttpResponse<Object>> {
    const data = await this.serviceUser.resetPassword(id, dto);
    return {
      message: menssageSuccessResponse('contraseña').put,
      data,
    };
  }

  // Eliminar usuario
  @Delete('delete-user/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.serviceUser.delete(id);
    return { message: menssageSuccessResponse('usuario').delete, data };
  }
}
