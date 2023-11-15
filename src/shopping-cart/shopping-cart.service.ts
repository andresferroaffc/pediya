import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ShoppingCart, User } from '../shared/entity';
import { Repository } from 'typeorm';
import {
  EditShoppingCartDto,
  ShoppingCartDto,
} from '../shared/dto/shopping-cart';
import { menssageErrorResponse } from '../messages';
import { validatExistException } from '../common/utils';
import { RoleEnum } from '../common/enum';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectRepository(ShoppingCart)
    private shoppingCartRepo: Repository<ShoppingCart>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Agregar carrito de compras
  async addShoppingCart(
    idBuyer: number,
    roleBuyer: string,
    dto: ShoppingCartDto,
  ): Promise<ShoppingCart> {
    let product = null;
    let user = null;
    let seller = null;

    if (roleBuyer !== RoleEnum.Cliente) {
      if (!dto.customer) {
        throw new BadRequestException([
          menssageErrorResponse('customer').notEmpty,
        ]);
      } else {
        const userExis = await this.userRepo.findOneBy({
          id: dto.customer,
          status: true,
        });
        validatExistException(userExis, 'cliente', 'ValidateNoexist');
        user = userExis;
      }
    }

    // Validar si el producto ya existe en el carrito de compras
    const addExist = await this.findExis(idBuyer, roleBuyer, dto);

    if (!addExist) {
      const buyerExis = await this.userRepo.findOneBy({
        id: idBuyer,
        status: true,
      });
      validatExistException(buyerExis, 'usuario', 'ValidateNoexist');

      if (roleBuyer !== RoleEnum.Cliente) {
        seller = buyerExis;
      } else {
        user = buyerExis;
      }

      const producExis = await this.productRepo.findOneBy({
        id: dto.product,
        status: true,
      });
      validatExistException(producExis, 'producto', 'ValidateNoexist');
      product = producExis;

      const newData = this.shoppingCartRepo.create({
        ...dto,
        product_id: product,
        seller_id: seller,
        user_id: user,
      });
      return await this.shoppingCartRepo.save(newData).catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('productos del carrito de compras').postError,
        );
      });
    } else {
      const updateData: EditShoppingCartDto = {
        count: addExist.count + dto.count,
      };
      return await this.update(addExist.id, updateData);
    }
  }

  // Validar si ya existe el producto por el cliente y vendedor en el carrito de compras
  async findExis(idBuyer: number, roleBuyer: string, dto: ShoppingCartDto) {
    let where = {
      product_id: dto.product,
      user_id: { id: null },
      seller_id: { id: null },
    };
    if (roleBuyer === RoleEnum.Cliente) {
      where.user_id.id = idBuyer;
      delete where.seller_id;
    } else {
      where.user_id.id = dto.customer;
      where.seller_id.id = idBuyer;
    }

    const addExis = await this.shoppingCartRepo
      .createQueryBuilder()
      .where(where)
      .getOne();

    return addExis;
  }

  // Consultar todos los grupos
  async findAll(id: number, role: string): Promise<ShoppingCart[]> {
    let where: object;
    if (role === RoleEnum.Cliente) {
      where = { user_id: { id: id } };
    } else {
      where = { seller_id: { id: id } };
    }

    const data = await this.shoppingCartRepo
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.product_id', 'product')
      .leftJoinAndSelect('cart.user_id', 'user')
      .leftJoinAndSelect('cart.seller_id', 'seller')
      .where(where)
      .getMany()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('productos del carrito de compras').getError,
        );
      });
    return data;
  }

  // Consultar un carrito de compras
  async findOne(id: number): Promise<ShoppingCart> {
    const data = await this.shoppingCartRepo
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.product_id', 'product')
      .leftJoinAndSelect('cart.user_id', 'user')
      .leftJoinAndSelect('cart.seller_id', 'seller')
      .where({ id: id })
      .getOne()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('producto del carrito de compras').getOneError,
        );
      });
    validatExistException(data, 'carrito de compras', 'ValidateNoexist');
    return data;
  }

  // Modificar carrito de compras
  async update(id: number, dto: EditShoppingCartDto): Promise<ShoppingCart> {
    const data = await this.findOne(id);
    return await this.shoppingCartRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('producto del carrito de compras').putError,
        );
      });
  }

  // Eliminar carrito de compras
  async delete(id: number): Promise<boolean> {
    const data = await this.findOne(id);
    await this.shoppingCartRepo.delete(data).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('producto del carrito de compras').deleteError,
      );
    });
    return true;
  }
}
