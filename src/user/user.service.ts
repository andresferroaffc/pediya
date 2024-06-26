import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectOrderBy, validatExistException } from '../common/utils';
import { menssageErrorResponse } from '../messages';
import { Repository } from 'typeorm';
import { Role, TypeDocument, User } from '../shared/entity';
import {
  EditUserDto,
  ResetPasswordAdminDto,
  ResetPasswordDto,
  UserDto,
} from '../shared/dto';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import * as bcrypt from 'bcrypt';
import { RoleEnum } from 'src/common/enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(TypeDocument)
    private typeDocumentRepo: Repository<TypeDocument>,
  ) {}

  // Crear usuario
  async create(dto: UserDto): Promise<User> {
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    dto.password = bcrypt.hashSync(dto.password, 10);
    const rolExis = await this.roleRepo.findOneBy({
      name: dto.role,
    });
    validatExistException(rolExis, 'rol', 'ValidateNoexist');
    const typeDocExis = await this.typeDocumentRepo.findOneBy({
      id: dto.typeDocument,
    });
    validatExistException(typeDocExis, 'tipo documento', 'ValidateNoexist');
    if (dto.role !== RoleEnum.Vendedor && dto.is_dropshipping === true) {
      throw new BadRequestException(
        'Error, solo los usuarios con rol vendedor pueden ser dropshipping',
      );
    }

    // Validar si ya exste un vendedor por defecto
    if (dto.is_default_seller && dto.is_default_seller === true) {
      const is_default_seller_exis = await this.userRepo.findOneBy({
        is_default_seller: true,
      });
      validatExistException(
        is_default_seller_exis,
        'vendedor por defecto para los clientes',
        'validatExistOne',
      );
    }

    const newData = this.userRepo.create({
      ...dto,
      role: rolExis,
      type_document_id: typeDocExis,
      type_person: dto.typePerson,
    });
    return await this.userRepo
      .save(newData)
      .then(async (data) => {
        delete data.password;
        delete data.reset_password_token;
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
    const data = await this.userRepo
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .innerJoinAndSelect('user.type_document_id', 'type_document')
      .getMany()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('usuarios').getError,
        );
      });
    return data;
  }

  // Consultar un usuario
  async findOne(id: number, andWhere?: object): Promise<User> {
    let where = { id: id };
    if (andWhere) where = { ...where, ...andWhere };
    const data = await this.userRepo
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .innerJoinAndSelect('user.type_document_id', 'type_document')
      .where(where)
      .getOne()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('usuario').getOneError,
        );
      });
    validatExistException(data, 'usuario', 'ValidateNoexist');
    return data;
  }

  // Modificar usuario
  async update(
    idUser: number,
    role: string,
    dto: EditUserDto,
    id?: number,
  ): Promise<User> {
    let whereUser;

    if (role !== RoleEnum.Administrador && id && idUser !== id) {
      throw new BadRequestException(
        'Error, No tienes los permisos para editar este usuario.',
      );
    }
    if (role === RoleEnum.Administrador && id) {
      whereUser = id;
    } else {
      whereUser = idUser;
    }

    const data = await this.findOne(whereUser);
    let roleValue = data.role;
    let typeDoc = data.type_document_id;
    let type_person = data.type_person;
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });

    if (dto.role) {
      const rolExis = await this.roleRepo.findOneBy({
        name: dto.role,
      });
      validatExistException(rolExis, 'rol', 'ValidateNoexist');
      roleValue = rolExis;
      if (dto.role !== RoleEnum.Vendedor && dto.is_dropshipping === true) {
        throw new BadRequestException(
          'Error, solo los usuarios con rol vendedor pueden ser dropshipping',
        );
      }
    }

    if (dto.typeDocument) {
      const typeDocExis = await this.typeDocumentRepo.findOneBy({
        id: dto.typeDocument,
      });
      validatExistException(typeDocExis, 'tipo documento', 'ValidateNoexist');
      typeDoc = typeDocExis;
    }

    if (dto.typePerson) {
      type_person = dto.typePerson;
    }

    if (dto.is_default_seller && dto.is_default_seller === true) {
      const is_default_seller_exis = await this.userRepo.findOneBy({
        is_default_seller: true,
      });
      validatExistException(
        is_default_seller_exis,
        'vendedor por defecto para los clientes',
        'validatExistOne',
      );
    }

    const newData = this.userRepo.create({
      ...data,
      ...dto,
      role: roleValue,
      type_document_id: typeDoc,
      type_person: type_person,
    });
    return await this.userRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('usuario').putError);
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
    paginateData.innerJoinAndSelect('user.role', 'role');
    paginateData.innerJoinAndSelect('user.type_document_id', 'type_document');
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
      const { user, email, phone1, phone2, document } = data;
      switch (key) {
        case 'user':
          Exist = await this.userRepo.findOneBy({
            user: user,
          });
          if (Exist) return { valid: false, key: 'usuario' };
          break;
        case 'email':
          Exist = await this.userRepo.findOneBy({
            email: email,
          });
          if (Exist) return { valid: false, key: 'correo' };
          break;
        case 'phone1':
          Exist = await this.userRepo.findOneBy({
            phone1: phone1,
          });
          if (Exist) return { valid: false, key: 'telefono 1' };
          break;
        case 'phone2':
          Exist = await this.userRepo.findOneBy({
            phone2: phone2,
          });
          if (Exist) return { valid: false, key: 'telefono 2' };
          break;
        case 'document':
          Exist = await this.userRepo.findOneBy({
            document: document,
          });
          if (Exist) return { valid: false, key: 'documento' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: User) {
    let Exist;
    for (const key in data) {
      const { user, email, phone1, phone2, document } = data;
      switch (key) {
        case 'user':
          if (user !== consult.user) {
            Exist = await this.userRepo.findOneBy({
              user: user,
            });

            if (Exist) return { valid: false, key: 'usuario' };
            break;
          }

        case 'email':
          if (email !== consult.email) {
            Exist = await this.userRepo.findOneBy({
              email: email,
            });
            if (Exist) return { valid: false, key: 'correo' };
            break;
          }

        case 'phone1':
          if (phone1 !== consult.phone1) {
            Exist = await this.userRepo.findOneBy({
              phone1: phone1,
            });
            if (Exist) return { valid: false, key: 'telefono 1' };
            break;
          }
        case 'phone2':
          if (phone2 !== consult.phone2) {
            Exist = await this.userRepo.findOneBy({
              phone2: phone2,
            });
            if (Exist) return { valid: false, key: 'telefono 2' };
            break;
          }

        case 'document':
          if (document !== consult.document) {
            Exist = await this.userRepo.findOneBy({
              document: document,
            });
            if (Exist) return { valid: false, key: 'documento' };
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
      await this.userRepo.save(data).catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('usuario').postError,
        );
      });
      return true;
    } else {
      throw new BadRequestException({
        message: 'La contraseña antigua es incorrecta',
        valid: false,
      });
    }
  }

  // Asignar Contraseña como administrador
  async resetPassword(id: number, dto: ResetPasswordAdminDto) {
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
    const dataPass = new ResetPasswordDto();
    dataPass.oldpassword = data.password;
    dataPass.newpassword = dto.newpassword;
    return await this.changePassword(dataPass, id, 'RESET');
  }

  // Eliminar usuario
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.userRepo.delete({ id: data.id }).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('usuario').deleteError,
      );
    });
    return true;
  }
}
