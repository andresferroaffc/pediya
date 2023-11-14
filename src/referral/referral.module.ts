import { Module } from '@nestjs/common';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from 'src/shared/entity';
import { ProductReferral } from '../shared/entity/product-referral';

@Module({
  imports: [TypeOrmModule.forFeature([Referral, ProductReferral])],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
