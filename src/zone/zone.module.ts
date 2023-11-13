import { Module } from '@nestjs/common';
import { ZoneController } from './zone.controller';
import { ZoneService } from './zone.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission, Discount, Zone } from '../shared/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Zone, Discount, Commission])],
  controllers: [ZoneController],
  providers: [ZoneService],
})
export class ZoneModule {}
