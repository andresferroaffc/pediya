import { Injectable, BadRequestException } from '@nestjs/common';
import { EditStatusReferralDto, ReferralDto } from '../shared/dto';
import {
  Commission,
  Discount,
  PaymentMethod,
  Product,
  Referral,
  ShoppingCart,
  Zone,
} from '../shared/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProductReferral } from '../shared/entity';
import { RoleEnum, TypeCommission } from '../common/enum';
import { validatExistException } from '../common/utils';
import { menssageErrorResponse } from '../messages';
import { StatusReferralEnum } from '../common/enum/status_referral';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private referrralRepo: Repository<Referral>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(ProductReferral)
    private productReferralRepo: Repository<ProductReferral>,
    @InjectRepository(ShoppingCart)
    private shoppingCartRepo: Repository<ShoppingCart>,
    @InjectRepository(Zone)
    private zoneRepo: Repository<Zone>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Discount)
    private discountRepo: Repository<Discount>,
    @InjectRepository(Commission)
    private commissionRepo: Repository<Commission>,
  ) {}

  // Crear remision
  async create(
    idUser: number,
    role: string,
    dropshipping: boolean,
    dto: ReferralDto,
  ) {
    let whereShoppingCart: object;
    let discountProductGeneral: number = 0;
    let amountValue: number = 0;
    let commissionZone: number = 0;
    let commissionDefault: number = 0;
    let commissionAmount: number = 0;
    let commissionProductGeneral: number = 0;
    const consecutive = await this.generateUniqueCode();

    // Crear condicion de consulta dependiendo del rol del usuario
    if (role !== RoleEnum.Cliente) {
      whereShoppingCart = { seller_id: { id: idUser, status: true } };
    } else {
      whereShoppingCart = {
        user_id: { id: idUser, status: true },
        seller_id: IsNull(),
      };
    }

    // Consultar zonas y sus comisones y descuentos
    const zoneExis = await this.zoneRepo
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.commission_id', 'commission')
      .leftJoinAndSelect('zone.discount_id', 'discount')
      .where({ id: dto.zone })
      .getOne()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('zona').getOneError,
        );
      });
    validatExistException(zoneExis, 'zona', 'ValidateNoexist');

    // Consultar metodo de pago
    const paymentMethodExis = await this.paymentMethodRepo
      .findOneBy({ id: dto.payment_method })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('zona').getOneError,
        );
      });
    validatExistException(
      paymentMethodExis,
      'metodo de pago',
      'ValidateNoexist',
    );

    // Porductos del carrito de compras
    const productShoppingCartExis = await this.shoppingCartRepo
      .createQueryBuilder('cart')
      .innerJoinAndSelect('cart.product_id', 'product')
      .leftJoinAndSelect('product.commission_id', 'commission')
      .leftJoinAndSelect('product.discount_id', 'discount')
      .leftJoinAndSelect('cart.user_id', 'user')
      .leftJoinAndSelect('cart.seller_id', 'seller')
      .where(whereShoppingCart)
      .getMany()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('productos del carrito de compras').getError,
        );
      });
    validatExistException(
      productShoppingCartExis,
      'carrito de compras',
      'ValidateNoexist',
    );

    // Procesa datos del producto para generar los calculos y validaciones de la remision
    for (const data of productShoppingCartExis) {
      if (data.product_id.status === false) {
        throw new BadRequestException(
          `Error, el producto ${data.product_id.name}, no esta disponible.`,
        );
      }
      // Validar si la catidad soliciada de producto existe en el stock
      if (data.count > data.product_id.stock) {
        throw new BadRequestException(
          `Error, no existen unidades suficientes para la compra del producto ${data.product_id.name}. Cantidad solicitada : ${data.count}, cantidad en inventario : ${data.product_id.stock}.`,
        );
      }
      const totalAmountProduct = data.product_id.price * data.count;
      amountValue = amountValue + totalAmountProduct;
      // Generar descuento por producto
      const discountProduct =
        data.product_id.discount_id === null
          ? 0
          : totalAmountProduct * (data.product_id.discount_id.percentage / 100);
      discountProductGeneral = discountProductGeneral + discountProduct;

      // Generar comision por producto
      const commissionProduct =
        data.product_id.commission_id === null
          ? 0
          : totalAmountProduct *
            (data.product_id.commission_id.percentage / 100);
      commissionProductGeneral = discountProductGeneral + commissionProduct;
    }

    // Descuentos
    const discountAmountExis = await this.discountRepo
      .createQueryBuilder('discount')
      .where(
        'discount.minimum_amount <= :amountValue and discount.minimum_amount > 0',
        { amountValue },
      )
      .orderBy('discount.minimum_amount', 'DESC')
      .getOne();
    const discountZone =
      zoneExis.discount_id === null
        ? 0
        : amountValue * (zoneExis.discount_id.percentage / 100);
    const discountAmount =
      discountAmountExis === null
        ? 0
        : amountValue * (discountAmountExis.percentage / 100);

    amountValue =
      amountValue - (discountAmount + discountZone + discountProductGeneral);

    // Comisiones
    if (role !== RoleEnum.Cliente && dropshipping === true) {
      // Consultar comision general o comison por defecto
      const comissionAmountExisGeneral = await this.commissionRepo.findOneBy({
        type: TypeCommission.GENERAL,
      });
      validatExistException(
        comissionAmountExisGeneral,
        'comision general',
        'ValidateNoexist',
      );

      const commissionAmountExis = await this.discountRepo
        .createQueryBuilder('commission')
        .where(
          'commission.minimum_amount <= :amountValue and commission.minimum_amount > 0',
          { amountValue },
        )
        .orderBy('commission.minimum_amount', 'DESC')
        .getOne();

      commissionZone =
        zoneExis.commission_id === null
          ? 0
          : amountValue * (zoneExis.commission_id.percentage / 100);
      commissionAmount =
        commissionAmountExis === null
          ? 0
          : amountValue * (commissionAmountExis.percentage / 100);
      commissionDefault = zoneExis.commission_id
        ? 0
        : amountValue * (comissionAmountExisGeneral.percentage / 100);
    }

    const newDataReferral = this.referrralRepo.create({
      consecutive: consecutive,
      date_of_elaboration: new Date(),
      payment_method_value: amountValue,
      seller_id: productShoppingCartExis[0].seller_id,
      payment_methods_id: paymentMethodExis,
      description: dto.description,
      zone_id: zoneExis,
      user_id: productShoppingCartExis[0].user_id,
      status: StatusReferralEnum.PendientePago,
      discount_amount_value: discountAmount,
      discount_zone_value: discountZone,
      discount_products_value: discountProductGeneral,
      commission_amount_value: commissionAmount,
      commission_zone_value: commissionZone,
      commission_products_value: commissionProductGeneral,
      commission_default_value: commissionDefault,
    });

    const referralSave = await this.referrralRepo
      .save(newDataReferral)
      .then(async (value) => {
        delete value.zone_id.discount_id;
        delete value.zone_id.commission_id;
        return value;
      })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('remision').postError,
        );
      });

    // Guardar productos remision
    const arrayProductReferral = await this.savePorductReferral(
      productShoppingCartExis,
      referralSave,
    );

    // Eliminar productos del carrito de compras
    // this.shoppingCartRepo.remove(productShoppingCartExis);

    return { referralSave, arrayProductReferral };
  }

  // Generar codigo unico para remisiones
  async generateUniqueCode(): Promise<string> {
    let consecutive: string;
    do {
      consecutive = Math.random().toString(36).substring(2, 12).toUpperCase();
    } while (await this.referrralRepo.findOneBy({ consecutive: consecutive }));

    return consecutive;
  }

  // Generar codigo unico para productos de las remisiones
  async generateUniqueCodePoroductReferral(): Promise<string> {
    let consecutive: string;
    do {
      consecutive = Math.random().toString(36).substring(2, 12).toUpperCase();
    } while (
      await this.productReferralRepo.findOneBy({ consecutive: consecutive })
    );

    return consecutive;
  }

  // Guardar productos de la remision
  async savePorductReferral(
    dataProduct: ShoppingCart[],
    dataReferral: Referral,
  ) {
    let arrayProductReferral: ProductReferral[] = [];
    for (const data of dataProduct) {
      const consecutive = await this.generateUniqueCodePoroductReferral();
      // Generar descuentos por producto
      const discount_value =
        data.product_id.discount_id === null
          ? 0
          : data.count *
            data.product_id.price *
            (data.product_id.discount_id.percentage / 100);

      // Generar comision por producto
      const commission_value =
        data.product_id.commission_id === null
          ? 0
          : data.count *
            data.product_id.price *
            (data.product_id.commission_id.percentage / 100);

      const newData = this.productReferralRepo.create({
        consecutive: consecutive,
        quantity: data.count,
        unit_value: data.product_id.price,
        product: data.product_id,
        referral: dataReferral,
        discount_value: discount_value,
        commission_value: commission_value,
      });

      await this.productReferralRepo
        .save(newData)
        .then(async (value) => {
          delete value.referral;
          delete value.product.commission_id;
          delete value.product.discount_id;
          arrayProductReferral.push(value);
        })
        .catch(async (error) => {
          this.referrralRepo.delete({ id: dataReferral.id });
          console.log(error);
          throw new BadRequestException(
            menssageErrorResponse('remision con sus productos').postError,
          );
        });
    }

    // Descontar cantidades del stock
    await this.discountProduct(dataReferral.id, dataProduct);

    return arrayProductReferral;
  }

  // Descontar cantidad del producto del stock
  async discountProduct(idReferral: number, dataProduct: ShoppingCart[]) {
    let arrayProduct = [];
    for (const data of dataProduct) {
      const productExis = await this.productRepo.findOneBy({
        id: data.product_id.id,
      });
      productExis.stock = productExis.stock - data.count;
      arrayProduct.push(productExis);
    }
    await this.productRepo.save(arrayProduct).catch(async (error) => {
      this.referrralRepo.delete({ id: idReferral });
      console.log(error);
      throw new BadRequestException(
        menssageErrorResponse(
          'Error, al descontar unidades del stock.',
        ).general,
      );
    });
  }

  // Modificar estado de la remison
  async updateStatusReferral(id: number, dto: EditStatusReferralDto) {
    const status = StatusReferralEnum.Cancelada;
    const data = await this.referrralRepo
      .createQueryBuilder('referral')
      .where('referral.id = :id AND referral.status <> :status ', {
        id,
        status,
      })
      .getOne();
    validatExistException(data, 'remision', 'ValidateNoexist');
    data.status = dto.status_referral;
    return await this.referrralRepo.save({ ...data }).catch(async (error) => {
      console.log(error);
      throw new BadRequestException(menssageErrorResponse('remision').putError);
    });
  }

  // Consultar remision
  async findOne(id: number, idUser: number, role: string): Promise<object> {
    let whereShoppingCart;
    // Crear condicion de consulta dependiendo del rol del usuario
    switch (role) {
      case RoleEnum.Vendedor:
        whereShoppingCart = { id: id, seller_id: { id: idUser, status: true } };
        break;
      case RoleEnum.Administrador:
        whereShoppingCart = { id: id };
        break;
      case RoleEnum.Cliente:
        whereShoppingCart = {
          id: id,
          user_id: { id: idUser, status: true },
          seller_id: IsNull(),
        };
        break;
      default:
        throw new BadRequestException(
          `Erro, el rol ${role}, no existe en el sistema.`,
        );
    }

    const referralExis = await this.referrralRepo
      .createQueryBuilder('referral')
      .leftJoinAndSelect('referral.seller_id', 'seller')
      .leftJoinAndSelect('referral.user_id', 'user')
      .innerJoinAndSelect('referral.payment_methods_id', 'payment_methods')
      .leftJoinAndSelect('referral.zone_id', 'zone')
      .where(whereShoppingCart)
      .getOne();
    validatExistException(referralExis, 'remision', 'ValidateNoexist');
    delete referralExis.zone_id.discount_id;
    delete referralExis.zone_id.commission_id;
    const arrayProductReferral = await this.findPorductReferral(id);
    return { referralExis, arrayProductReferral };
  }

  // Consultar productos de la remison
  async findPorductReferral(id: number) {
    const data = await this.productReferralRepo
      .createQueryBuilder('referral')
      .innerJoinAndSelect('referral.product', 'product')
      .where({ referral: { id: id } })
      .getMany()
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('productos de remision').getError,
        );
      });

    return data;
  }
}
