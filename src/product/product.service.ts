import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Commission, Discount, Product } from '../shared/entity';
import { Repository } from 'typeorm';
import { EditProductDto, ProductDto } from '../shared/dto';
import { menssageErrorResponse } from '../messages';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { SelectOrderBy, validatExistException } from '../common/utils';
import { GroupService } from '../group/group.service';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { TypeProduct } from '../common/enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Discount)
    private discountRepo: Repository<Discount>,
    @InjectRepository(Commission)
    private commissionRepo: Repository<Commission>,
    private groupService: GroupService,
  ) {}

  // Crear producto
  async create(dto: ProductDto): Promise<Product> {
    let commission = null;
    let discount = null;
    const attributeExist = await this.uniqueAttribute(dto);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });
    if (dto.stock && dto.min_tock && dto.stock < dto.min_tock)
      throw new BadRequestException({
        message:
          'El valor del stock no puede ser menor al valor minimo del stock',
        valied: false,
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

    const group = await this.groupService.findOne(dto.inventory_group_id);
    validatExistException(group, 'grupo inventario', 'ValidateNoexist');
    const newData = this.productRepo.create({
      ...dto,
      inventory_group_id: group,
      commission_id: commission,
      discount_id: discount,
    });
    return await this.productRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse('producto').postError,
      );
    });
  }

  // Consultar todos los productos
  async findAll(): Promise<Product[]> {
    const data = await this.productRepo
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.inventory_group_id', 'group')
      .leftJoinAndSelect('product.commission_id', 'commission')
      .leftJoinAndSelect('product.discount_id', 'discount')
      .orderBy('product.name', 'ASC')
      .getMany()
      .catch(async (error) => {
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
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.inventory_group_id', 'group')
      .leftJoinAndSelect('product.commission_id', 'commission')
      .leftJoinAndSelect('product.discount_id', 'discount')
      .where(where)
      .getOne()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('producto').getOneError,
        );
      });
    validatExistException(data, 'producto', 'ValidateNoexist');
    return data;
  }

    // Consultar un producto codigo
    async findOneProductCode(code:string): Promise<Product> {
      const data = await this.productRepo
        .createQueryBuilder('product')
        .innerJoinAndSelect('product.inventory_group_id', 'group')
        .leftJoinAndSelect('product.commission_id', 'commission')
        .leftJoinAndSelect('product.discount_id', 'discount')
        .where({code:code})
        .getOne()
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
    const data = await this.findOne(id);
    let group = data.inventory_group_id;
    const attributeExist = await this.uniqueAttributeUpdate(dto, data);
    if (attributeExist)
      throw new BadRequestException({
        message: 'El atributo ya está en uso',
        attributeExist,
      });

    if (dto.stock && dto.min_tock && dto.stock < dto.min_tock)
      throw new BadRequestException({
        message:
          'El valor del stock no puede ser menor al valor minimo del stock',
        valied: false,
      });

    if (dto.inventory_group_id) {
      const groupExist = await this.groupService.findOne(
        dto.inventory_group_id,
      );
      group = groupExist;
    }

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
    const newData = { ...data, ...dto, inventory_group_id: group };
    delete newData.commission;
    delete newData.discount;
    return await this.productRepo.save(newData).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('producto').putError);
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
    paginateData.leftJoinAndSelect('product.commission_id', 'commission');
    paginateData.leftJoinAndSelect('product.discount_id', 'discount');
    paginateData.innerJoinAndSelect('product.inventory_group_id', 'group');
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
          if (Exist) return { valid: false, key: 'codigo' };
          break;
        case 'name':
          Exist = await this.productRepo.findOneBy({
            name: name,
          });
          if (Exist) return { valid: false, key: 'nombre' };
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

            if (Exist) return { valid: false, key: 'codigo' };
            break;
          }

        case 'name':
          if (name !== consult.name) {
            Exist = await this.productRepo.findOneBy({
              name: name,
            });
            if (Exist) return { valid: false, key: 'nombre' };
            break;
          }
      }
    }
  }

  // Eliminar producto
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);

    await this.productRepo.delete({ id: data.id }).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('producto').deleteError,
      );
    });
    this.deleteImage(data.img);
    return true;
  }

  // Guardar imagen del producto
  async saveImage(fileName: string, id: number) {
    const data = await this.findOne(id);
    await this.deleteImage(data.img);
    this.productRepo.update(data.id, { img: fileName });
    return true;
  }

  async deleteImageUpdate(id: number) {
    const data = await this.findOne(id);
    this.productRepo.update(data.id, { img: null });
    return await this.deleteImage(data.img);
  }

  // Eliminar imagen del producto
  async deleteImage(filname: string) {
    fs.unlink(`./image-products/${filname}`, (err) => {
      if (err) {
        console.error(err);
        return err;
      }
    });
    return true;
  }

  // Cargar productos desde archivo excel
  async changeProduct() {
    let dataExcel;
    let arrayDataProduct = [];
    try {
      const workbook = XLSX.readFile('./excel/Listado_productos.xlsx');
      const workbookSheets = workbook.SheetNames;
      const sheet = workbookSheets[0];
      dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
    } catch (Error) {
      console.log(Error);
      throw new BadRequestException(
        'Error, al cargar el archivo Listado_productos.xlsx, verifica la ruta, el nombre o la extencion.',
      );
    }

    for (const itemFila of dataExcel) {
      const group = await this.groupService
        .findOneGroup(itemFila['Grupo de inventario'])
        .catch(async (value) => {
          throw new BadRequestException(
            `Error, El Grupo inventario ${itemFila['Grupo de inventario']}, no esta registrado en el sistema.`,
          );
        });
      const type =
        itemFila['Tipo'] === 'Producto'
          ? TypeProduct.PRODUCTO
          : TypeProduct.SERVICIO;
      const status =
        itemFila['Estado'].toUpperCase() === 'ACTIVO' ? true : false;
      const inventoried =
        itemFila['Inventariable'].toUpperCase() === 'SI' ? true : false;
      const createProduct = this.productRepo.create({
        type: type,
        code: itemFila['Código'],
        name: itemFila['Nombre'],
        status: status,
        stock: parseInt(itemFila['Saldo cantidades']),
        price: parseFloat(itemFila['Precio de venta 1']),
        inventoried: inventoried,
        inventory_group_id:group
      });
    }
  }
}
