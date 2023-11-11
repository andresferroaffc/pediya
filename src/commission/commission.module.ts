import { Module } from '@nestjs/common';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission } from '../shared/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commission])],
  controllers: [CommissionController],
  providers: [CommissionService]
})
export class CommissionModule {}
