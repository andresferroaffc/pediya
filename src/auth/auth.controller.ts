import { Body, Controller, Post, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto, RestPassworDto } from '../shared/dto/auth';
import { ApiTags } from '@nestjs/swagger';
import { menssageSuccessResponse } from '../messages';
import { HttpResponse, SuccessAuth} from '../shared/dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Logueo en la plataforma
  @Post('login')
  async login(@Body() body: AuthLoginDto): Promise<HttpResponse<SuccessAuth>> {
    const data = await this.authService.login(body);
    return { message: menssageSuccessResponse('').login, data };
  }

  // Olvido contrseña
  @Post('forgot-password')
  async resetpassword(
    @Body() body: RestPassworDto,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.authService.resetpassword(body);
    return { message: menssageSuccessResponse('').resetPassword, data };
  }

  // Cambiar contraseña
  @Patch('new-password/:token')
  async newpassword(
    @Param('token') token: uuidv4,
    @Body() body: AuthLoginDto,
  ): Promise<HttpResponse<boolean>> {
    const data = await this.authService.newpassword(token, body);
    return { message: menssageSuccessResponse('contraseña').put, data };
  }
}
