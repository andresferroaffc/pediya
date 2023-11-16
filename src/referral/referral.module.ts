import { Module } from '@nestjs/common';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Commission,
  Discount,
  Product,
  Referral,
  User,
} from 'src/shared/entity';
import { ProductReferral } from '../shared/entity/product-referral';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Referral,
      ProductReferral,
      User,
      Discount,
      Commission,
      Product,
    ]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
