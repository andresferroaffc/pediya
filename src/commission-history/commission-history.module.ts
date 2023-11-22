import { Module } from '@nestjs/common';
import { CommissionHistoryService } from './commission-history.service';
import { CommissionHistoryController } from './commission-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionHistory } from '../shared/entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommissionHistory])],
  providers: [CommissionHistoryService],
  controllers: [CommissionHistoryController],
})
export class CommissionHistoryModule {}
