import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Parameter, Role, TypeDocument, User } from '../shared/entity';
import { TypePerson } from '../common/enum';

// Crear roles por defecto
@Injectable()
export class DefaultDataService {
  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;
  @InjectRepository(Parameter)
  private readonly parameterRepository: Repository<Parameter>;
  @InjectRepository(TypeDocument)
  private readonly typeDocumentRepository: Repository<TypeDocument>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  // Crear rol por defecto
  async createRole() {
    const newData = this.roleRepository.create([
      {
        description: 'Administrador',
        name: 'ADMIN',
      },
      {
        description: 'Cliente',
        name: 'CLI',
      },
      {
        description: 'Vendedor',
        name: 'VEN',
      },
    ]);
    newData.forEach(async (element) => {
      const existData = await this.roleRepository.findOneBy({
        name: element.name,
      });
      if (!existData) {
        this.roleRepository.save(element).catch((Error) => {
          throw new BadRequestException(
            'Error, al crear los roles por defecto :' + Error,
          );
        });
      }
    });
  }

  // Crear parametros por defecto
  async createParameter() {
    const newData = this.parameterRepository.create([
      {
        seller_commission: false,
        name_enterprise: null,
        address: null,
        phone: null,
        email: null,
        description: null,
      },
    ]);
    newData.forEach(async (element) => {
      const existData = await this.parameterRepository.find();
      if (existData.length === 0) {
        this.parameterRepository.save(element).catch((Error) => {
          throw new BadRequestException(
            'Error, al crear los parametros por defecto :' + Error,
          );
        });
      }
    });
  }

  // Crear tipo de documento por defecto
  async createTypeDocument() {
    const newData = this.typeDocumentRepository.create([
      {
        name: 'CC',
        description: 'Cedula de ciudadania',
      },
    ]);
    newData.forEach(async (element) => {
      const existData = await this.typeDocumentRepository.findOneBy({
        name: element.name,
      });
      if (!existData) {
        this.typeDocumentRepository.save(element).catch((Error) => {
          throw new BadRequestException(
            'Error, al crear los tipos de documento por defecto :' + Error,
          );
        });
      }
    });
  }

  // Crear usuario por defecto
  async createUser() {
    const existDataTypeDocument = await this.typeDocumentRepository.findOneBy({
      name: 'CC',
    });
    const existDataRole = await this.roleRepository.findOneBy({
      name: 'ADMIN',
    });

    const newData = this.userRepository.create([
      {
        document: '123456789',
        user: 'ADMIN',
        role: existDataRole,
        phone1: '123456789',
        phone2: '123456789',
        address: '',
        type_person: TypePerson.PERSONA,
        reset_password_token: null,
        type_document_id: existDataTypeDocument,
        names: 'ADMIN',
        surnames: 'ADMIN',
        email: 'administrador@admin.com',
        password: bcrypt.hashSync('123456', 10),
        is_dropshipping: false,
        departament_code: '',
        city_code: '',
        is_default_seller: true,
      },
    ]);
    newData.forEach(async (element) => {
      const existData = await this.userRepository
        .createQueryBuilder('user')
        .where('user.user = :user', {
          user: 'ADMIN',
        })
        .getOne();
      if (!existData) {
        this.userRepository.save(element).catch((Error) => {
          throw new BadRequestException(
            'Error, al crear el administrador por defecto :' + Error,
          );
        });
      }
    });
  }
}
