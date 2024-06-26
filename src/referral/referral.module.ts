import { Module } from '@nestjs/common';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { ProductReferral } from '../shared/entity/product-referral';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Referral,
      ProductReferral,
      User,
      Product,
      PaymentMethod,
      Zone,
      ShoppingCart,
      Commission,
      Discount,
      Parameter,
      CommissionHistory,
      User
    ]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
