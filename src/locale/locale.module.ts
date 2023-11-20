import { Module } from '@nestjs/common';
import { LocaleService } from './locale.service';
import { LocaleController } from './locale.controller';

@Module({
  providers: [LocaleService],
  controllers: [LocaleController]
})
export class LocaleModule {}
