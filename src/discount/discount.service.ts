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
import { DiscountDto, EditDiscountDto } from '../shared/dto';
import { Discount } from '../shared/entity';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private discountRepo: Repository<Discount>,
  ) {}

  // Crear descuento
  async create(dto: DiscountDto): Promise<Discount> {
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

    const newData = this.discountRepo.create({ ...dto });
    return await this.discountRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('descuento').postError,
      );
    });
  }

  // Consultar todos los descuentos
  async findAll(): Promise<Discount[]> {
    const data = await this.discountRepo.find().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('descuentos').getError,
      );
    });
    return data;
  }

  // Consultar un descuento
  async findOne(id: number, andWhere?: object): Promise<Discount> {
    let where = { id: id };
    if (andWhere) where = { ...where, ...andWhere };
    const data = await this.discountRepo
      .findOneBy(where)
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('descuento').getOneError,
        );
      });
    validatExistException(data, 'descuento', 'ValidateNoexist');
    return data;
  }

  // Modificar descuento
  async update(id: number, dto: EditDiscountDto): Promise<Discount> {
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

    return await this.discountRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('descuento').putError,
        );
      });
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<Discount>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData = await this.discountRepo.createQueryBuilder('Discount');
    paginateData.orderBy(`Discount.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('descuentos').getError,
      );
    });
    return paginate<Discount>(paginateData, options);
  }

  // Validar existencia de los atributos unicos
  async uniqueAttribute(data: any) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          Exist = await this.discountRepo.findOneBy({
            name: name,
          });
          if (Exist) return { valid: false, key: 'nombre' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: Discount) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          if (name !== consult.name) {
            Exist = await this.discountRepo.findOneBy({
              name: name,
            });
            if (Exist) return { valid: false, key: 'nombre' };
            break;
          }
      }
    }
  }

  // Eliminar descuento
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.discountRepo.delete(data).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('descuento').deleteError,
      );
    });
    return true;
  }
}
