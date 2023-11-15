import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Commission } from '../shared/entity';
import { Repository } from 'typeorm';
import { CommissionDto, EditCommissionDto } from '../shared/dto';
import { menssageErrorResponse } from '../messages';
import { SelectOrderBy, validatExistException } from '../common/utils';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Commission)
    private commissionRepo: Repository<Commission>,
  ) {}

  // Crear comision
  async create(dto: CommissionDto): Promise<Commission> {
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });

    if (dto.percentage < 0 || dto.percentage > 100) {
      throw new BadRequestException(
        'Error, el porcentaje tiene que estar en este rango (0-100).',
      );
    }

    if (dto.minimum_amount < 0) {
      throw new BadRequestException(
        'Error, el monto minimo debe ser un valor positivo.',
      );
    }

    // Validar comison general
    const isGeneral = await this.commissionRepo.findOneBy({ is_general: true });
    if (isGeneral && dto.is_general === true) {
      throw new BadRequestException('Error, ya existe una comision general.');
    }

    const newData = this.commissionRepo.create({ ...dto });
    return await this.commissionRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('comision').postError,
      );
    });
  }

  // Consultar todas las comisiones
  async findAll(): Promise<Commission[]> {
    const data = await this.commissionRepo.find().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('comisiones').getError,
      );
    });
    return data;
  }

  // Consultar una comision
  async findOne(id: number, andWhere?: object): Promise<Commission> {
    let where = { id: id };
    if (andWhere) where = { ...where, ...andWhere };
    const data = await this.commissionRepo
      .findOneBy(where)
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('comision').getOneError,
        );
      });
    validatExistException(data, 'comision', 'ValidateNoexist');
    return data;
  }

  // Modificar comision
  async update(id: number, dto: EditCommissionDto): Promise<Commission> {
    const data = await this.findOne(id);
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    if (dto.percentage && (dto.percentage < 0 || dto.percentage > 100)) {
      throw new BadRequestException(
        'Error, el porcentaje tiene que estar en este rango (0-100).',
      );
    }

    if (dto.minimum_amount && dto.minimum_amount < 0) {
      throw new BadRequestException(
        'Error, el monto minimo debe ser positivo.',
      );
    }

    // Validar comison general
    const isGeneral = await this.commissionRepo
      .createQueryBuilder('commission')
      .where({ is_general: true })
      .andWhere("commission.id != :id",{id})
      .getOne();
    if (isGeneral && dto.is_general === true) {
      throw new BadRequestException('Error, ya existe una comision general.');
    }
    return await this.commissionRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('comision').putError,
        );
      });
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<Commission>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData =
      await this.commissionRepo.createQueryBuilder('Commission');
    paginateData.orderBy(`Commission.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('comisiones').getError,
      );
    });
    return paginate<Commission>(paginateData, options);
  }

  // Validar existencia de los atributos unicos
  async uniqueAttribute(data: any) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          Exist = await this.commissionRepo.findOneBy({
            name: name,
          });
          if (Exist) return { valid: false, key: 'nombre' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: Commission) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          if (name !== consult.name) {
            Exist = await this.commissionRepo.findOneBy({
              name: name,
            });
            if (Exist) return { valid: false, key: 'nombre' };
            break;
          }
      }
    }
  }

  // Eliminar comision
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.commissionRepo.delete({ id: data.id }).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('comision').deleteError,
      );
    });
    return true;
  }
}
