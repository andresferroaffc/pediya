import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../shared/entity';
import { Repository } from 'typeorm';
import { EditProductDto, ProductDto } from '../shared/dto';
import { menssageErrorResponse } from '../messages';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { SelectOrderBy, validatExistException } from '../common/utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  // Crear producto
  async create(dto: ProductDto): Promise<Product> {
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    if (dto.stock < dto.min_tock)
      throw new BadRequestException({
        message:
          'El valor del stock no puede ser menor al valor minimo del stock',
        valied: false,
      });
    const newData = this.productRepo.create({ ...dto });
    return await this.productRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('producto').postError,
      );
    });
  }

  // Consultar todos los productos
  async findAll(): Promise<Product[]> {
    const data = await this.productRepo.find().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('productos').getError,
      );
    });
    return data;
  }

  // Consultar un producto
  async findOne(id: number, andWhere?: object): Promise<Product> {
    let where = { id: id };
    if (andWhere) where = { ...where, ...andWhere };
    const data = await this.productRepo
      .findOneBy(where)
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('producto').getOneError,
        );
      });
    validatExistException(data, 'producto', 'ValidateNoexist');
    return data;
  }

  // Modificar producto
  async update(id: number, dto: EditProductDto): Promise<Product> {
    const data = await this.findOne(id, { status: true });
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    return await this.productRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('producto').putError,
        );
      });
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<Product>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData = await this.productRepo.createQueryBuilder('product');
    paginateData.orderBy(`product.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('productos').getError,
      );
    });
    return paginate<Product>(paginateData, options);
  }

  // Validar existencia de los atributos unicos
  async uniqueAttribute(data: any) {
    let Exist;
    for (const key in data) {
      const { code, name } = data;
      switch (key) {
        case 'code':
          Exist = await this.productRepo.findOneBy({
            code: code,
          });
          if (Exist) return { valid: false, key: 'code' };
          break;
        case 'name':
          Exist = await this.productRepo.findOneBy({
            name: name,
          });
          if (Exist) return { valid: false, key: 'name' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: Product) {
    let Exist;
    for (const key in data) {
      const { code, name } = data;
      switch (key) {
        case 'code':
          if (code !== consult.code) {
            Exist = await this.productRepo.findOneBy({
              code: code,
            });

            if (Exist) return { valid: false, key: 'code' };
            break;
          }

        case 'name':
          if (name !== consult.name) {
            Exist = await this.productRepo.findOneBy({
              name: name,
            });
            if (Exist) return { valid: false, key: 'name' };
            break;
          }
      }
    }
  }
}
