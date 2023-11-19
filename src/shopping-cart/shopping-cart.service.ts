import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ShoppingCart, User } from '../shared/entity';
import { IsNull, Repository } from 'typeorm';
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
    validatExistException(
      addExist,
      'producto del carrito de compras',
      'validatExistOne',
    );

    const buyerExis = await this.userRepo.findOneBy({
      id: idBuyer,
      status: true,
    });
    validatExistException(buyerExis, 'usuario', 'ValidateNoexist');

    if (roleBuyer !== RoleEnum.Cliente) {
      seller = buyerExis;
      // Validar que solo adicione al carrito porductos de un solo cliente
      const lastRecord = await this.shoppingCartRepo
        .createQueryBuilder('referral')
        .leftJoinAndSelect('referral.user_id', 'user')
        .where({ seller_id: seller })
        .orderBy('referral.id', 'DESC')
        .getOne();
      if (lastRecord && lastRecord.user_id.id !== dto.customer) {
        throw new BadRequestException(
          'Error, no puedes adicionar productos de otro cliente a este carrito de compras.',
        );
      }
    } else {
      user = buyerExis;
    }

    const producExis = await this.productRepo.findOneBy({
      id: dto.product,
      status: true,
    });
    validatExistException(producExis, 'producto', 'ValidateNoexist');
    product = producExis;

    // Validar si existen unidades suficientes en el stock
    if (dto.count > producExis.stock) {
      throw new BadRequestException(
        'Error, no existen unidades suficientes para la compra.',
      );
    }

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
  }

  // Validar si ya existe el producto por el cliente y vendedor en el carrito de compras
  async findExis(idBuyer: number, roleBuyer: string, dto: ShoppingCartDto) {
    let where = {
      product_id: dto.product,
      user_id: null,
      seller_id: null,
    };
    if (roleBuyer === RoleEnum.Cliente) {
      where.user_id = { id: idBuyer };
      where.seller_id = IsNull();
    } else {
      where.user_id = { id: dto.customer };
      where.seller_id = { id: idBuyer };
    }

    const addExis = await this.shoppingCartRepo
      .createQueryBuilder()
      .where(where)
      .getOne();

    return addExis;
  }

  // Consultar todos los productos del carrito por usuario
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
  async findOne(
    id: number,
    idUser: number,
    role: string,
  ): Promise<ShoppingCart> {
    let where: object;
    if (role === RoleEnum.Cliente) {
      where = { id: id, user_id: { id: idUser } };
    } else {
      where = { id: id, seller_id: { id: idUser } };
    }
    const data = await this.shoppingCartRepo
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.product_id', 'product')
      .leftJoinAndSelect('cart.user_id', 'user')
      .leftJoinAndSelect('cart.seller_id', 'seller')
      .where(where)
      .getOne()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('producto del carrito de compras').getOneError,
        );
      });
    validatExistException(
      data,
      'producto del carrito de compras',
      'ValidateNoexist',
    );
    return data;
  }

  // Modificar carrito de compras
  async update(
    id: number,
    idUser: number,
    role: string,
    dto: EditShoppingCartDto,
  ): Promise<ShoppingCart> {
    const data = await this.findOne(id, idUser, role);
    // Validar si existen unidades suficientes en el stock
    if (dto.count > data.product_id.stock) {
      throw new BadRequestException(
        'Error, no existen unidades suficientes para la compra.',
      );
    }
    return await this.shoppingCartRepo
      .save({ ...data, ...dto })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('producto del carrito de compras').putError,
        );
      });
  }

  // Eliminar producto del carrito de compras
  async delete(id: number, idUser: number, role: string): Promise<boolean> {
    const data = await this.findOne(id, idUser, role);
    await this.shoppingCartRepo.delete({ id: data.id }).catch(async (error) => {
      console.log(error);
      throw new UnprocessableEntityException(
        menssageErrorResponse('producto del carrito de compras').deleteError,
      );
    });
    return true;
  }
  
}
