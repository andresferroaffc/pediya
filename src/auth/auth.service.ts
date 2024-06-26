import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../shared/entity';
import { AuthLoginDto, RestPassworDto } from '../shared/dto';
import { menssageErrorResponse } from '../messages';
import { validatExistException } from '../common/utils';
import { templateResetpass } from '../sendemail/templates';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // Metodo de validacion de credenciales y logueo
  async login(user: AuthLoginDto): Promise<Record<string, any>> {
    // Transform body into DTO
    const userDTO = new AuthLoginDto();
    userDTO.user = user.user;
    userDTO.password = user.password;
    // Get user information
    const userDetails = await this.usersRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.user',
        'user.email',
        'user.password',
        'user.is_dropshipping',
      ])
      .innerJoinAndSelect('user.role', 'role')
      .where({
        user: userDTO.user,
        status: true,
      })
      .getOne();
    if (!userDetails) {
      throw new UnauthorizedException(
        menssageErrorResponse('Credenciales invalidas').general,
      );
    }

    if (userDetails === undefined || userDetails === null) {
      return { status: 401, msg: { msg: 'Credenciales invalidas' } };
    }

    // Check if the given password match with saved password
    const isValid = bcrypt.compareSync(user.password, userDetails.password);
    if (isValid) {
      return {
        status: 200,
        msg: {
          user: userDetails.user,
          expiresIn: process.env.JWT_EXPIRES_IN,
          access_token: this.jwtService.sign(
            {
              email: userDetails.email,
              id: userDetails.id,
              user: userDetails.user,
              role: userDetails.role.name,
              dropshipping: userDetails.is_dropshipping,
            },
            { expiresIn: process.env.JWT_EXPIRES_IN },
          ),
        },
      };
    } else {
      throw new UnauthorizedException(
        menssageErrorResponse('Credenciales invalidas').general,
      );
    }
  }

  // Servicio, olvido contraseña
  async resetpassword(dto: RestPassworDto) {
    const user = await this.usersRepo.findOneBy({
      email: dto.email,
    });
    validatExistException(user, 'email', 'ValidateNoexist');
    const linkReset = uuidv4();
    await this.usersRepo
      .update({ id: user.id }, { reset_password_token: linkReset })
      .catch(async (Error) => {
        throw new BadRequestException('Error', Error);
      });
    return true;
  }

  // Cambiar contraseña
  async newpassword(token: uuidv4, dto: AuthLoginDto) {
    const user = await this.usersRepo.findOneBy({
      reset_password_token: token,
      user: dto.user,
      status: true,
    });
    validatExistException(user, 'token', 'ValidateNoexist');

    const newPassword = await bcrypt.hashSync(dto.password, 10);

    await this.usersRepo
      .update(
        { id: user.id },
        { reset_password_token: null, password: newPassword },
      )
      .catch(async (Error) => {
        throw new BadRequestException('Error', Error.detail);
      });

    return true;
  }
}
