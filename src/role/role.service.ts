import { BadRequestException, Injectable } from '@nestjs/common';
import {
  paginate,
  IPaginationOptions,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Role } from '../shared/entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectOrderBy, validatExistException } from '../common/utils';
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
      .findOneBy({ role: role })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(menssageErrorResponse('rol').getOneError);
      });
    validatExistException(data, 'rol', 'validatExistOne');
    return data;
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<Role>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData = this.roleRepo.createQueryBuilder('role');
    paginateData.orderBy(`role.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('roles').getError);
    });
    return paginate<Role>(paginateData, options);
  }
}
