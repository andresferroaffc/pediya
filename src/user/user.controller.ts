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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EditUserDto, HttpResponse, Userdto } from '../shared/dto';
import { UserService } from './user.service';
import { menssageSuccessResponse } from '../messages';
import { User } from '../shared/entity';
import { Roles } from '../common/decorator';
import { RoleEnum } from '../common/enum';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/strategy/roles.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Crear usuario
  @Post('create-user')
  @ApiBearerAuth()
  async create(@Body() dto: Userdto): Promise<HttpResponse<User>> {
    const data = await this.userService.create(dto);
    return { message: menssageSuccessResponse('usuario').post, data };
  }

  // Consultar un usuario
  @Get('find/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponse<User>> {
    const data = await this.userService.findOne(id);
    return { message: menssageSuccessResponse('usuario').getOne, data };
  }

  // Consultar todos los usuarios
  @Get('all')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async findAll() {
    const data = await this.userService.findAll();
    return { message: menssageSuccessResponse('usuarios').get, data };
  }

  // Modificar usuario
  @Patch('update-user/:id')
  @Roles(RoleEnum.Administrador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async updateUser(
    @Param('id') id: number,
    @Body() dto: EditUserDto,
  ): Promise<HttpResponse<User>> {
    const data = await this.userService.update(id, dto);
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
    const data = await this.userService.paginate(sort, order, {
      page,
      limit,
    });
    return { message: menssageSuccessResponse('usuarios').get, data };
  }
}
