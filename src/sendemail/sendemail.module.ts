import { Module } from "@nestjs/common";
import { SendemailService } from './sendemail.service';

@Module({
  providers: [SendemailService],
  exports: [SendemailService],
})
export class SendemailModule {}
