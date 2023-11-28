import { Injectable, BadRequestException } from '@nestjs/common';
import { EditStatusReferralDto, ReferralDto } from '../shared/dto';
import {
  Commission,
  CommissionHistory,
  Discount,
  Parameter,
  PaymentMethod,
  Product,
  Referral,
  ShoppingCart,
  User,
  Zone,
} from '../shared/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProductReferral } from '../shared/entity';
import {
  RoleEnum,
  TypeCommission,
  TypeCommissionHistory,
} from '../common/enum';
import { validatExistException } from '../common/utils';
import { menssageErrorResponse } from '../messages';
import { StatusReferralEnum } from '../common/enum/status_referral';
import * as xl from 'excel4node';
import { format } from 'date-fns';

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
    @InjectRepository(Parameter)
    private parameterRepo: Repository<Parameter>,
    @InjectRepository(CommissionHistory)
    private commissionHistoryRepo: Repository<CommissionHistory>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Consultar parametros
  async findOneParamete(): Promise<Parameter> {
    const parameterExis = await this.parameterRepo.find();
    validatExistException(parameterExis, `parametro`, 'ValidateNoexistMany');
    return parameterExis[0];
  }

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
      commissionProductGeneral = commissionProductGeneral + commissionProduct;
    }

    // Descuentos
    const discountAmountExis = await this.discountRepo
      .createQueryBuilder('discount')
      .where(
        'discount.minimum_amount <= :amountValue and discount.minimum_amount >= 1',
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

    // Validar si el vendedor de la empresa puede resivir comisiones
    const validateCommissionVen = await this.findOneParamete();

    // Comisiones
    if (
      role !== RoleEnum.Cliente &&
      (dropshipping === true ||
        validateCommissionVen.seller_commission === true)
    ) {
      // Consultar comision general o comison por defecto
      const comissionAmountExisGeneral = await this.commissionRepo.findOneBy({
        type: TypeCommission.GENERAL,
      });
      validatExistException(
        comissionAmountExisGeneral,
        'comision general',
        'ValidateNoexist',
      );

      const commissionAmountExis = await this.commissionRepo
        .createQueryBuilder('commission')
        .where(
          'commission.minimum_amount <= :amountValue and commission.minimum_amount >= 1',
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
    } else {
      commissionProductGeneral = 0;
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
      role,
      dropshipping,
      validateCommissionVen.seller_commission,
    );

    // Eliminar productos del carrito de compras
    this.shoppingCartRepo.remove(productShoppingCartExis);

    // Comision general
    const commissionGeneral =
      commissionAmount +
      commissionZone +
      commissionProductGeneral +
      commissionDefault;

    if (
      role !== RoleEnum.Cliente &&
      (dropshipping === true ||
        validateCommissionVen.seller_commission === true)
    ) {
      // Insertar registro de comision en el hsitorial
      const commissionHistory = this.commissionHistoryRepo.create({
        status: TypeCommissionHistory.NOPAGO,
        amount: commissionGeneral,
        referral_id: referralSave,
      });

      this.commissionHistoryRepo.save(commissionHistory);
    }

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
      consecutive = Math.floor(
        1000000000 + Math.random() * 9000000000,
      ).toString();
    } while (
      await this.productReferralRepo.findOneBy({ consecutive: consecutive })
    );

    return consecutive;
  }

  // Guardar productos de la remision
  async savePorductReferral(
    dataProduct: ShoppingCart[],
    dataReferral: Referral,
    role: string,
    dropshipping: boolean,
    validateCommissionVen: boolean,
  ) {
    let arrayProductReferral: ProductReferral[] = [];
    for (const data of dataProduct) {
      let commission_value: number = 0;
      const consecutive = await this.generateUniqueCodePoroductReferral();
      // Generar descuentos por producto
      const discount_value =
        data.product_id.discount_id === null
          ? 0
          : data.count *
            data.product_id.price *
            (data.product_id.discount_id.percentage / 100);

      if (
        role !== RoleEnum.Cliente &&
        (dropshipping === true || validateCommissionVen === true)
      ) {
        // Generar comision por producto
        commission_value =
          data.product_id.commission_id === null
            ? 0
            : data.count *
              data.product_id.price *
              (data.product_id.commission_id.percentage / 100);
      }
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
    return await this.referrralRepo
      .save({ ...data })
      .then(async (value) => {
        if (data.status === StatusReferralEnum.Cancelada) {
          this.restoreStock(data.id);
        }
        return value;
      })
      .catch(async (error) => {
        console.log(error);
        throw new BadRequestException(
          menssageErrorResponse('remision').putError,
        );
      });
  }

  // Restaurar stock
  async restoreStock(idReferral: number) {
    const arrayProductReferral = await this.findPorductReferral(idReferral);
    for (const data of arrayProductReferral) {
      const newStock = data.product.stock + data.quantity;
      await this.productRepo
        .update(data.product.id, { stock: newStock })
        .catch((Error) => {
          console.log(Error);
          throw new BadRequestException(
            menssageErrorResponse('stock del producto').putError,
          );
        });
    }

    const commissionHistoryExis = await this.commissionHistoryRepo.findOneBy({
      referral_id: { id: idReferral },
    });
    if (commissionHistoryExis) {
      commissionHistoryExis.status = TypeCommissionHistory.CANCELADO;
      commissionHistoryExis.description =
        'El pago de la comision se cancelo por que la remison fue cancelada.';
      this.commissionHistoryRepo.save(commissionHistoryExis);
    }
  }

  // Condicion para consulta de remisiones
  async generateWhereReferral(id: number, idUser: number, role: string) {
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
    return whereShoppingCart;
  }

  // Consultar una remision
  async findOne(id: number, idUser: number, role: string): Promise<object> {
    const whereShoppingCart = await this.generateWhereReferral(
      id,
      idUser,
      role,
    );
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

  // Consultar remisiones
  async findAll(idUser: number, role: string): Promise<object> {
    let referralMany = [];
    const whereShoppingCart = await this.generateWhereReferral(0, idUser, role);
    delete whereShoppingCart.id;
    const referralExis = await this.referrralRepo
      .createQueryBuilder('referral')
      .leftJoinAndSelect('referral.seller_id', 'seller')
      .leftJoinAndSelect('referral.user_id', 'user')
      .innerJoinAndSelect('referral.payment_methods_id', 'payment_methods')
      .leftJoinAndSelect('referral.zone_id', 'zone')
      .where(whereShoppingCart)
      .getMany();

    for (const data of referralExis) {
      delete data.zone_id.discount_id;
      delete data.zone_id.commission_id;
      const arrayProductReferral = await this.findPorductReferral(data.id);
      referralMany.push({ data, arrayProductReferral });
    }

    return referralMany;
  }

  // Consultar remisiones por fechas
  async findAllDate(date: string): Promise<object> {
    let referralMany = [];
    const status = StatusReferralEnum.Cancelada;
    const referralExis = await this.referrralRepo
      .createQueryBuilder('referral')
      .leftJoinAndSelect('referral.seller_id', 'seller')
      .leftJoinAndSelect('referral.user_id', 'user')
      .innerJoinAndSelect('referral.payment_methods_id', 'payment_methods')
      .leftJoinAndSelect('referral.zone_id', 'zone')
      .where(
        'referral.date_of_elaboration LIKE :date and  referral.status <> :status',
        { date: `%${date}%`, status: status },
      )
      .orderBy('referral.date_of_elaboration', 'DESC')
      .getMany();

    for (const data of referralExis) {
      delete data.zone_id.discount_id;
      delete data.zone_id.commission_id;
      const arrayProductReferral = await this.findPorductReferral(data.id);
      referralMany.push({ data, arrayProductReferral });
    }

    return referralMany;
  }

  // Generar archivo excel de remisiones por dia
  async generateExcelReferral(date: string) {
    const data = await this.findAllDate(date);
    const userIsDefault = await this.userRepo.findOneBy({
      is_default_seller: true,
    });
    validatExistException(
      userIsDefault,
      'vendedor por defecto',
      'ValidateNoexist',
    );
    try {
      return new Promise(async (resolve, reject) => {
        var wb = new xl.Workbook();

        // Estilo de las celdas
        var style = wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#FF1F1F', // Código de color rojo
          },
          font: {
            color: '#FFFFFF',
            size: 11,
          },
        });

        var style2 = wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#0E72CA', // Código de color rojo
          },
          font: {
            color: '#FFFFFF',
            size: 11,
          },
        });

        // Hoja de trabajo
        var ws = wb.addWorksheet('Hoja1');
        ws.cell(1, 1).string('Tipo de comprobante').style(style);
        ws.cell(1, 2).string('Consecutivo').style(style);
        ws.cell(1, 3).string('Identificación tercero').style(style);
        ws.cell(1, 4).string('Sucursal').style(style2);
        ws.cell(1, 5).string('Código centro/subcentro de costos').style(style2);
        ws.cell(1, 6).string('Fecha de elaboración  ').style(style);
        ws.cell(1, 7).string('Sigla Moneda').style(style2);
        ws.cell(1, 8).string('Tasa de cambio').style(style2);
        ws.cell(1, 9).string('Nombre contacto').style(style2);
        ws.cell(1, 10).string('Email Contacto').style(style2);
        ws.cell(1, 11).string('Orden de compra').style(style2);
        ws.cell(1, 12).string('Orden de entrega').style(style2);
        ws.cell(1, 13).string('Fecha orden de entrega').style(style2);
        ws.cell(1, 14).string('Código producto').style(style).style(style2);
        ws.cell(1, 15).string('Descripción producto').style(style2);
        ws.cell(1, 16).string('Identificación vendedor').style(style);
        ws.cell(1, 17).string('Código de Bodega').style(style2);
        ws.cell(1, 18).string('Cantidad producto').style(style);
        ws.cell(1, 19).string('Valor unitario').style(style);
        ws.cell(1, 20).string('Valor Descuento').style(style2);
        ws.cell(1, 21).string('Base AIU').style(style2);
        ws.cell(1, 22)
          .string('Identificación ingreso para terceros')
          .style(style2);
        ws.cell(1, 23).string('Código impuesto cargo').style(style2);
        ws.cell(1, 24).string('Código impuesto cargo dos').style(style2);
        ws.cell(1, 25).string('Código impuesto retención').style(style2);
        ws.cell(1, 26).string('Código ReteICA').style(style2);
        ws.cell(1, 27).string('Código ReteIVA').style(style2);
        ws.cell(1, 28).string('Código forma de pago').style(style);
        ws.cell(1, 29).string('Valor Forma de Pago').style(style);
        ws.cell(1, 30).string('Fecha Vencimiento').style(style2);
        ws.cell(1, 31).string('Observaciones').style(style2);

        let positionColum = 2;

        for (const item in data) {
          for (const value of data[item].arrayProductReferral) {
            const dateReferral = new Date(data[item].data.date_of_elaboration);
            const newdateReferral = format(dateReferral, 'yyyy-MM-dd');
            const documentSeller =
              data[item].data.seller_id === null
                ? userIsDefault.document
                : data[item].data.seller_id.document;
            const amount =
              value.quantity * value.unit_value -
              parseFloat(value.discount_value);
            ws.cell(positionColum, 1).string('1');
            ws.cell(positionColum, 2).number(parseInt(value.consecutive));
            ws.cell(positionColum, 3).string(data[item].data.user_id.document);
            ws.cell(positionColum, 6).date(newdateReferral.toLocaleString());
            ws.cell(positionColum, 14).string(value.product.code);
            ws.cell(positionColum, 16).string(documentSeller);
            ws.cell(positionColum, 18).number(value.quantity);
            ws.cell(positionColum, 19).number(parseFloat(value.unit_value));
            ws.cell(positionColum, 20).number(parseFloat(value.discount_value));
            ws.cell(positionColum, 28).number(
              data[item].data.payment_methods_id.id,
            );
            ws.cell(positionColum, 29).number(amount);
            positionColum = positionColum + 1;
          }
        }

        wb.write('./excel/Modelo de importacion de facturas.xlsx');
        const path = './excel/Modelo de importacion de facturas.xlsx';

        // Escribir el archivo Excel de forma asíncrona
        wb.write(path, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(path);
          }
        });
      });
    } catch (Error) {
      console.log(Error);
      throw new BadRequestException(
        'Error, al generar el excel de remisiones.',
      );
    }
  }

  // Consultar reporte por parametros

  async findReferralParameter(where: object | string): Promise<object> {
    let referralMany = [];
    const referralExis = await this.referrralRepo
      .createQueryBuilder('referral')
      .leftJoinAndSelect('referral.seller_id', 'seller')
      .leftJoinAndSelect('referral.user_id', 'user')
      .innerJoinAndSelect('referral.payment_methods_id', 'payment_methods')
      .leftJoinAndSelect('referral.zone_id', 'zone')
      .where(where)
      .orderBy('referral.date_of_elaboration', 'DESC')
      .getMany();

    for (const data of referralExis) {
      delete data.zone_id.discount_id;
      delete data.zone_id.commission_id;
      const arrayProductReferral = await this.findPorductReferral(data.id);
      referralMany.push({ data, arrayProductReferral });
    }

    return referralMany;
  }

  // Consultar reportes entre fechas
  async findReportsDate(dateInit: string, dateEnd: string) {
    if (!dateInit || !dateEnd) {
      throw new BadRequestException(
        'Error, debe ingresar la fecha inicial y la fecha final.',
      );
    }
    const init = new Date(dateInit);
    const end = new Date(dateEnd);

    if (init > end) {
      throw new BadRequestException(
        'Error, la fecha inical no puede ser mayor a la final.',
      );
    }
    const where = `referral.date_of_elaboration >= '${dateInit} 00:00:00' and referral.date_of_elaboration <= '${dateEnd} 23:59:59'`;
    const data = await this.findReferralParameter(where);
    return data;
  }

  // Consultar reportes por vendedor
  async findReportsSeller(id: number) {
    const where = { seller_id: { id: id } };
    const data = await this.findReferralParameter(where);
    return data;
  }

  // Consultar reportes por cliente
  async findReportsCustomer(id: number) {
    const where = { user_id: { id: id } };
    const data = await this.findReferralParameter(where);
    return data;
  }

  // Generar excel de reporte por intervalo de fechas
  async generateExcelReferralDownloadDate(dateInit: string, dateEnd: string) {
    if (!dateInit || !dateEnd) {
      throw new BadRequestException(
        'Error, debe ingresar la fecha inicial y la fecha final.',
      );
    }
    const data = await this.findReportsDate(dateInit, dateEnd);
    return await this.excelReports(data);
  }

  // Generar excel de reporte por vendedor
  async generateExcelReferralDownloadSeller(id: number) {
    const data = await this.findReportsSeller(id);
    return await this.excelReports(data);
  }

  // Generar excel de reporte por cliente
  async generateExcelReferralDownloadCustomer(id: number) {
    const data = await this.findReportsCustomer(id);
    return await this.excelReports(data);
  }

  // Generar excel para reportes
  async excelReports(data: {}) {
    const userIsDefault = await this.userRepo.findOneBy({
      is_default_seller: true,
    });
    validatExistException(
      userIsDefault,
      'vendedor por defecto',
      'ValidateNoexist',
    );
    try {
      return new Promise(async (resolve, reject) => {
        var wb = new xl.Workbook();

        var style2 = wb.createStyle({
          fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#0E72CA', // Código de color rojo
          },
          font: {
            color: '#FFFFFF',
            size: 11,
          },
        });

        // Hoja de trabajo
        var ws = wb.addWorksheet('Hoja1');
        ws.cell(1, 1).string('Consecutivo').style(style2);
        ws.cell(1, 2).string('Fecha de elaboración  ').style(style2);
        ws.cell(1, 3).string('Nombre cliente').style(style2);
        ws.cell(1, 4).string('Identificación cliente').style(style2);
        ws.cell(1, 5).string('Nombre Vendedor').style(style2);
        ws.cell(1, 6).string('Identificación vendedor').style(style2);
        ws.cell(1, 7).string('Codigo producto').style(style2);
        ws.cell(1, 8).string('Cantidad producto').style(style2);
        ws.cell(1, 9).string('Valor unitario').style(style2);
        ws.cell(1, 10).string('Valor Descuento producto').style(style2);
        ws.cell(1, 11).string('Valor comision producto').style(style2);
        ws.cell(1, 12).string('Forma de pago').style(style2);
        ws.cell(1, 13).string('Valor Pago').style(style2);

        let positionColum = 2;

        for (const item in data) {
          for (const value of data[item].arrayProductReferral) {
            const dateReferral = new Date(data[item].data.date_of_elaboration);
            const newdateReferral = format(dateReferral, 'yyyy-MM-dd');
            const documentSeller =
              data[item].data.seller_id === null
                ? ''
                : data[item].data.seller_id.document;
            const nameSeller =
              data[item].data.seller_id === null
                ? ''
                : data[item].data.seller_id.names +
                  data[item].data.seller_id.surnames;
            const amount =
              value.quantity * value.unit_value -
              parseFloat(value.discount_value);
            ws.cell(positionColum, 1).string(data[item].data.consecutive);
            ws.cell(positionColum, 2).date(newdateReferral.toLocaleString());
            ws.cell(positionColum, 3).string(
              data[item].data.user_id.names + data[item].data.user_id.surnames,
            );
            ws.cell(positionColum, 4).string(data[item].data.user_id.document);
            ws.cell(positionColum, 5).string(nameSeller);
            ws.cell(positionColum, 6).string(documentSeller);
            ws.cell(positionColum, 7).string(value.product.code);
            ws.cell(positionColum, 8).number(value.quantity);
            ws.cell(positionColum, 9).number(parseFloat(value.unit_value));
            ws.cell(positionColum, 10).string(value.discount_value);
            ws.cell(positionColum, 11).string(value.commission_value);
            ws.cell(positionColum, 12).string(
              data[item].data.payment_methods_id.name,
            );
            ws.cell(positionColum, 13).number(amount);
            positionColum = positionColum + 1;
          }
        }

        wb.write('./excel/reporte.xlsx');
        const path = './excel/reporte.xlsx';

        // Escribir el archivo Excel de forma asíncrona
        wb.write(path, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(path);
          }
        });
      });
    } catch (Error) {
      console.log(Error);
      throw new BadRequestException(
        'Error, al generar el excel de remisiones.',
      );
    }
  }
}
