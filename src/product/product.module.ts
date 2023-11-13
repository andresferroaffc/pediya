import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission, Discount, Product } from '../shared/entity';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Discount, Commission]), GroupModule],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
