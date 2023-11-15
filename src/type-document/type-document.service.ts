import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeDocument } from '../shared/entity';
import { Repository } from 'typeorm';
import { EditTypeDocumentDto, TypeDocumentDto } from '../shared/dto';
import { menssageErrorResponse } from '../messages';
import { SelectOrderBy, validatExistException } from '../common/utils';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class TypeDocumentService {
  constructor(
    @InjectRepository(TypeDocument)
    private typeDocumentRepo: Repository<TypeDocument>,
  ) {}

  // Crear tipo documento
  async create(dto: TypeDocumentDto): Promise<TypeDocument> {
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    const newData = this.typeDocumentRepo.create({ ...dto });
    return await this.typeDocumentRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('tipo documento').postError,
      );
    });
  }

  // Consultar todos los tipos de documento
  async findAll(): Promise<TypeDocument[]> {
    const data = await this.typeDocumentRepo.find().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('tipos de documento').getError,
      );
    });
    return data;
  }

  // Consultar un tipo documento
  async findOne(id: number, andWhere?: object): Promise<TypeDocument> {
    let where = { id: id };
    if (andWhere) where = { ...where, ...andWhere };
    const data = await this.typeDocumentRepo
      .findOneBy(where)
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('tipo documento').getOneError,
        );
      });
    validatExistException(data, 'tipo documento', 'ValidateNoexist');
    return data;
  }

  // Modificar tipo documento
  async update(id: number, dto: EditTypeDocumentDto): Promise<TypeDocument> {
    const data = await this.findOne(id);
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    return await this.typeDocumentRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('tipo documento').putError,
        );
      });
  }

  // Consultar por paginación
  async paginate(
    sort: string,
    order: string | number,
    options: IPaginationOptions,
  ): Promise<Pagination<TypeDocument>> {
    sort = !sort ? 'id' : sort;
    order = !order ? 'ASC' : order;
    const orderBy = SelectOrderBy(order);
    const paginateData =
      await this.typeDocumentRepo.createQueryBuilder('TypeDocument');
    paginateData.orderBy(`TypeDocument.${sort}`, orderBy[0]);
    paginateData.getMany().catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('tipos de documento').getError,
      );
    });
    return paginate<TypeDocument>(paginateData, options);
  }

  // Validar existencia de los atributos unicos
  async uniqueAttribute(data: any) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          Exist = await this.typeDocumentRepo.findOneBy({
            name: name,
          });
          if (Exist) return { valid: false, key: 'nombre' };
          break;
      }
    }
  }

  // Validar existencia de los atributos unicos para el update
  async uniqueAttributeUpdate(data: any, consult: TypeDocument) {
    let Exist;
    for (const key in data) {
      const { name } = data;
      switch (key) {
        case 'name':
          if (name !== consult.name) {
            Exist = await this.typeDocumentRepo.findOneBy({
              name: name,
            });
            if (Exist) return { valid: false, key: 'nombre' };
            break;
          }
      }
    }
  }

  // Eliminar tipo documento
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.typeDocumentRepo.delete({ id: data.id }).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('tipo documento').deleteError,
      );
    });
    return true;
  }
}
