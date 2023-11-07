import { Module } from '@nestjs/common';
import { TypeDocumentController } from './type-document.controller';
import { TypeDocumentService } from './type-document.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeDocument } from '../shared/entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeDocument])],
  controllers: [TypeDocumentController],
  providers: [TypeDocumentService],
})
export class TypeDocumentModule {}
