import { Module } from '@nestjs/common';
import { TypeDocumentController } from './type-document.controller';
import { TypeDocumentService } from './type-document.service';

@Module({
  controllers: [TypeDocumentController],
  providers: [TypeDocumentService]
})
export class TypeDocumentModule {}
