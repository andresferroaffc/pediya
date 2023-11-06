import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectOrderBy, validatExistException } from '../common/utils';
import { SendemailService } from '../sendemail/sendemail.service';
import { menssageErrorResponse } from '../messages';
import { Repository } from 'typeorm';
import { Role, User } from '../shared/entity';
import { EditUserDto, ResetPasswordDto, UserDto } from '../shared/dto';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import {
  templateChagePasswordUser,
  templateCreateUser,
} from '../sendemail/templates';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private ServiceSemail: SendemailService,
  ) {}

  // Crear usuario
  async create(dto: UserDto): Promise<User> {
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    const password = dto.password;
    dto.password = bcrypt.hashSync(dto.password, 10);
    const rolExis = await this.roleRepo.findOneBy({
      role: dto.role,
    });
    validatExistException(rolExis, 'rol', 'ValidateNoexist');
    const newData = this.userRepo.create({ ...dto, role: rolExis });
    return await this.userRepo
      .save(newData)
      .then(async (data) => {
        const html = templateCreateUser(dto.user, password);
        this.ServiceSemail.sendemail('Usuario creado', data.email, html).catch(
          (error) => {
            console.log(error);
          },
        );
        delete data.password;
        delete data.resetPasswordToken;
        return data;
      })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('usuario').postError,
        );
      });
  }

  // Consultar todos los usuarios
  async findAll(): Promise<User[]> {
    const data = await this.userRepo.find().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('usuarios').getError);
    });
    return data;
  }

  // Consultar un usuario
  async findOne(id: number, andWhere?: object): Promise<User> {
    let where = { id: id };
    if (andWhere) where = { ...where, ...andWhere };
    const data = await this.userRepo.findOneBy(where).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('usuario').getOneError,
      );
    });
    validatExistException(data, 'usuario', 'ValidateNoexist');
    return data;
  }

  // Modificar usuario
  async update(id: number, dto: EditUserDto): Promise<User> {
    const data = await this.findOne(id, { status: true });
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    return await this.userRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('usuario').putError,
        );
      });
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<User>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData = await this.userRepo.createQueryBuilder('user');
    paginateData.orderBy(`user.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('usuarios').getError);
    });
    return paginate<User>(paginateData, options);
  }

  // Validar existencia de los atributos unicos
  async uniqueAttribute(data: any) {
    let Exist;
    for (const key in data) {
      const { user, email, phone, document } = data;
      switch (key) {
        case 'user':
          Exist = await this.userRepo.findOneBy({
            user: user,
          });
          if (Exist) return { valid: false, key: 'user' };
          break;
        case 'email':
          Exist = await this.userRepo.findOneBy({
            email: email,
          });
          if (Exist) return { valid: false, key: 'email' };
          break;
        case 'phone':
          Exist = await this.userRepo.findOneBy({
            phone: phone,
          });
          if (Exist) return { valid: false, key: 'phone' };
          break;
        case 'document':
          Exist = await this.userRepo.findOneBy({
            document: document,
          });
          if (Exist) return { valid: false, key: 'document' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: User) {
    let Exist;
    for (const key in data) {
      const { user, email, phone, document } = data;
      switch (key) {
        case 'user':
          if (user !== consult.user) {
            Exist = await this.userRepo.findOneBy({
              user: user,
            });

            if (Exist) return { valid: false, key: 'user' };
            break;
          }

        case 'email':
          if (email !== consult.email) {
            Exist = await this.userRepo.findOneBy({
              email: email,
            });
            if (Exist) return { valid: false, key: 'email' };
            break;
          }

        case 'phone':
          if (phone !== consult.phone) {
            Exist = await this.userRepo.findOneBy({
              phone: phone,
            });
            if (Exist) return { valid: false, key: 'phone' };
            break;
          }

        case 'document':
          if (document !== consult.document) {
            Exist = await this.userRepo.findOneBy({
              document: document,
            });
            if (Exist) return { valid: false, key: 'document' };
            break;
          }
      }
    }
  }

  // Consultar mi perfil
  async findProfile(id: number): Promise<User> {
    return this.findOne(id);
  }

  // Cambio de contraseña
  async changePassword(dto: ResetPasswordDto, id: number, code?: string) {
    const data = await this.userRepo
      .findOne({
        where: { id: id, status: true },
        select: ['id', 'email', 'password'],
      })
      .catch(async (Error) => {
        throw new BadRequestException(
          'Error valida el tipo de dato',
          Error.detail,
        );
      });
    validatExistException(data, 'usuario', 'ValidateNoexist');
    const isValid =
      code && code === 'RESET'
        ? dto.oldpassword
        : bcrypt.compareSync(dto.oldpassword, data.password);

    if (isValid) {
      const newPasswordBcrypt = bcrypt.hashSync(dto.newpassword, 10);
      data.password = newPasswordBcrypt;
      return await this.userRepo
        .save(data)
        .then((value) => {
          const html = templateChagePasswordUser(value.user, dto.newpassword);
          this.ServiceSemail.sendemail(
            'Cambio de contraseña',
            value.email,
            html,
          ).catch((error) => {
            console.log(error);
          });
          return {
            message:
              'Se enviaran las nuevas credenciales al siguiente correo ' +
              value.email,
          };
        })
        .catch(async (error) => {
          console.log(error);
          throw new BadRequestException(
            menssageErrorResponse('usuario').postError,
          );
        });
    } else {
      throw new BadRequestException({
        message: 'La contraseña antigua es incorrecta',
        valid: false,
      });
    }
  }

  // asignar Contraseña random solo por el administrador
  async resetPassword(id: number) {
    const data = await this.userRepo
      .findOne({
        where: { id: id, status: true },
        select: ['id', 'email', 'password'],
      })
      .catch(async (Error) => {
        throw new BadRequestException(
          'Error valida el tipo de dato',
          Error.detail,
        );
      });
    validatExistException(data, 'usuario', 'ValidateNoexist');
    const newPassword = uuidv4();
    const dto = new ResetPasswordDto();
    dto.oldpassword = data.password;
    dto.newpassword = newPassword;
    return await this.changePassword(dto, id, 'RESET');
  }

  // Eliminar usuario
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.userRepo.delete(data).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('usuario').deleteError,
      );
    });
    return true;
  }
}
