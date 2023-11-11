import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { SelectOrderBy, validatExistException } from '../common/utils';
import { menssageErrorResponse } from '../messages';
import { EditGroupDto, GroupDto } from '../shared/dto/group';
import { Group } from '../shared/entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  // Crear grupo
  async create(dto: GroupDto): Promise<Group> {
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    const newData = this.groupRepo.create({ ...dto });
    return await this.groupRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('grupo').postError);
    });
  }

  // Consultar todos los grupos
  async findAll(): Promise<Group[]> {
    const data = await this.groupRepo.find().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('grupos').getError);
    });
    return data;
  }

  // Consultar un grupo
  async findOne(id: number, andWhere?: object): Promise<Group> {
    let where = { id: id };
    if (andWhere) where = { ...where, ...andWhere };
    const data = await this.groupRepo.findOneBy(where).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('grupo').getOneError);
    });
    validatExistException(data, 'grupo', 'ValidateNoexist');
    return data;
  }

  // Modificar grupo
  async update(id: number, dto: EditGroupDto): Promise<Group> {
    const data = await this.findOne(id);
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    return await this.groupRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(menssageErrorResponse('grupo').putError);
      });
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<Group>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData = await this.groupRepo.createQueryBuilder('group');
    paginateData.orderBy(`group.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('grupos').getError);
    });
    return paginate<Group>(paginateData, options);
  }

  // Validar existencia de los atributos unicos
  async uniqueAttribute(data: any) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          Exist = await this.groupRepo.findOneBy({
            name: name,
          });
          if (Exist) return { valid: false, key: 'nombre' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: Group) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          if (name !== consult.name) {
            Exist = await this.groupRepo.findOneBy({
              name: name,
            });
            if (Exist) return { valid: false, key: 'nombre' };
            break;
          }
      }
    }
  }

  // Eliminar grupo
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.groupRepo.delete(data).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('grupo').deleteError,
      );
    });
    return true;
  }
}
