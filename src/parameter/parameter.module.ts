import { Module } from '@nestjs/common';
import { ParameterService } from './parameter.service';
import { ParameterController } from './parameter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parameter } from '../shared/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parameter])],
  providers: [ParameterService],
  controllers: [ParameterController],
})
export class ParameterModule {}
