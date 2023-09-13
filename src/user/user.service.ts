import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectOrderBy, validatExistException } from '../common/utils';
import { SendemailService } from '../sendemail/sendemail.service';
import { menssageErrorResponse } from '../messages';
import { Repository } from 'typeorm';
import { Role, User } from '../shared/entity';
import { EditUserDto, Userdto } from '../shared/dto';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { templateCreateUser } from '../sendemail/templates';
import * as bcrypt from 'bcrypt';

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
  async create(dto: Userdto): Promise<User> {
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
  async findOne(id: number): Promise<User> {
    const data = await this.userRepo
      .findOneBy({ id: id })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('usuario').getOneError,
        );
      });
    validatExistException(data, 'usuario', 'validatExistOne');
    return data;
  }

  // Modificar usuario
  async update(id: number, dto: EditUserDto): Promise<User> {
    const data = await this.findOne(id);
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
    const paginateData = this.userRepo.createQueryBuilder('user');
    paginateData.orderBy(`role.${sort}`, orderBy[0]);
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
}
