import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../shared/entity';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), GroupModule],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
