import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentMethod } from '../shared/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { menssageErrorResponse } from '../messages';
import { SelectOrderBy, validatExistException } from '../common/utils';
import { EditPaymentMethodDto, PaymentMethodDto } from '../shared/dto';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepo: Repository<PaymentMethod>,
  ) {}

  // Crear metodo de pago
  async create(dto: PaymentMethodDto): Promise<PaymentMethod> {
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });

    const newData = this.paymentMethodRepo.create({ ...dto });
    return await this.paymentMethodRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('metodo de pago').postError,
      );
    });
  }

  // Consultar todos los metodos de pago
  async findAll(): Promise<PaymentMethod[]> {
    const data = await this.paymentMethodRepo.find().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('metodos de pago').getError,
      );
    });
    return data;
  }

  // Consultar un metodo de pago
  async findOne(id: number, andWhere?: object): Promise<PaymentMethod> {
    let where = { id: id };
    if (andWhere) where = { ...where, ...andWhere };
    const data = await this.paymentMethodRepo
      .findOneBy(where)
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('metodo de pago').getOneError,
        );
      });
    validatExistException(data, 'metodo de pago', 'ValidateNoexist');
    return data;
  }

  // Modificar metodo de pago
  async update(id: number, dto: EditPaymentMethodDto): Promise<PaymentMethod> {
    const data = await this.findOne(id);
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });

    return await this.paymentMethodRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('metodo de pago').putError,
        );
      });
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<PaymentMethod>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData =
      await this.paymentMethodRepo.createQueryBuilder('PaymentMethod');
    paginateData.orderBy(`PaymentMethod.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('metodos de pago').getError,
      );
    });
    return paginate<PaymentMethod>(paginateData, options);
  }

  // Validar existencia de los atributos unicos
  async uniqueAttribute(data: any) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          Exist = await this.paymentMethodRepo.findOneBy({
            name: name,
          });
          if (Exist) return { valid: false, key: 'nombre' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: PaymentMethod) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          if (name !== consult.name) {
            Exist = await this.paymentMethodRepo.findOneBy({
              name: name,
            });
            if (Exist) return { valid: false, key: 'nombre' };
            break;
          }
      }
    }
  }

  // Eliminar metodo de pago
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.paymentMethodRepo.delete({ id: data.id }).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('metodo de pago').deleteError,
      );
    });
    return true;
  }
}
