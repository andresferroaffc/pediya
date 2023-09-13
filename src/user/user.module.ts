import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendemailService } from '../sendemail/sendemail.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Role, User } from '../shared/entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UserController],
  providers: [UserService, SendemailService],
  exports: [SendemailService],
})
export class UserModule {}
