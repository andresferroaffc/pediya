import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '../shared/entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validatExistException } from '../common/utils';
import { menssageErrorResponse } from '../messages';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  // Consultar todos los roles
  async findAll(): Promise<Role[]> {
    const data = await this.roleRepo.find().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('roles').getError);
    });
    return data;
  }

  // Consultar un rol
  async findOne(role: string): Promise<Role> {
    const data = await this.roleRepo
      .findOneBy({ name: role })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(menssageErrorResponse('rol').getOneError);
      });
    validatExistException(data, 'rol', 'ValidateNoexist');
    return data;
  }
}
