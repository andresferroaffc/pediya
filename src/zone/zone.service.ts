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
import { EditZoneDto, ZoneDto } from '../shared/dto';
import { Commission, Discount, Zone } from '../shared/entity';
import { Repository } from 'typeorm';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private zoneRepo: Repository<Zone>,
    @InjectRepository(Discount)
    private discountRepo: Repository<Discount>,
    @InjectRepository(Commission)
    private commissionRepo: Repository<Commission>,
  ) {}

  // Crear zona
  async create(dto: ZoneDto): Promise<Zone> {
    let commission = null;
    let discount = null;
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });

    if (dto.commission) {
      const comissionExis = await this.commissionRepo.findOneBy({
        id: dto.commission,
      });
      validatExistException(comissionExis, 'comision', 'ValidateNoexist');
      commission = comissionExis;
    }

    if (dto.discount) {
      const discountExis = await this.discountRepo.findOneBy({
        id: dto.discount,
      });
      validatExistException(discountExis, 'descuento', 'ValidateNoexist');
      discount = discountExis;
    }

    const newData = this.zoneRepo.create({
      ...dto,
      commission_id: commission,
      discount_id: discount,
    });

    return await this.zoneRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('zona').postError);
    });
  }

  // Consultar todas las zonas
  async findAll(): Promise<Zone[]> {
    const data = await this.zoneRepo
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.commission_id', 'commission')
      .leftJoinAndSelect('zone.discount_id', 'discount')
      .getMany()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(menssageErrorResponse('zonas').getError);
      });
    return data;
  }

  // Consultar una zona
  async findOne(id: number): Promise<Zone> {
    const data = await this.zoneRepo
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.commission_id', 'commission')
      .leftJoinAndSelect('zone.discount_id', 'discount')
      .where({ id: id })
      .getOne()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('zona').getOneError,
        );
      });
    validatExistException(data, 'zona', 'ValidateNoexist');
    return data;
  }

  // Modificar zona
  async update(id: number, dto: EditZoneDto): Promise<Zone> {
    const data = await this.findOne(id);
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });

    if (dto.commission === null) {
      data.commission_id = null;
    } else if (dto.commission) {
      const comissionExis = await this.commissionRepo.findOneBy({
        id: dto.commission,
      });
      validatExistException(comissionExis, 'comision', 'ValidateNoexist');
      data.commission_id = comissionExis;
    }

    if (dto.discount === null) {
      data.discount_id = null;
    } else if (dto.discount) {
      const discountExis = await this.discountRepo.findOneBy({
        id: dto.discount,
      });
      validatExistException(discountExis, 'descuento', 'ValidateNoexist');
      data.discount_id = discountExis;
    }

    const newData = { ...data, ...dto };
    delete newData.commission;
    delete newData.discount;
    return await this.zoneRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('zona').putError);
    });
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<Zone>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData = await this.zoneRepo.createQueryBuilder('zone');
    paginateData.leftJoinAndSelect('zone.commission_id', 'commission');
    paginateData.leftJoinAndSelect('zone.discount_id', 'discount');
    paginateData.orderBy(`zone.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('zonas').getError);
    });
    return paginate<Zone>(paginateData, options);
  }

  // Validar existencia de los atributos unicos
  async uniqueAttribute(data: any) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          Exist = await this.zoneRepo.findOneBy({
            name: name,
          });
          if (Exist) return { valid: false, key: 'nombre' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: Zone) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          if (name !== consult.name) {
            Exist = await this.zoneRepo.findOneBy({
              name: name,
            });
            if (Exist) return { valid: false, key: 'nombre' };
            break;
          }
      }
    }
  }

  // Eliminar zona
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.zoneRepo.delete(data).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('zona').deleteError,
      );
    });
    return true;
  }
}
