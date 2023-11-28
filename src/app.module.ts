import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { ProductModule } from './product/product.module';
import { GroupModule } from './group/group.module';
import { ReferralModule } from './referral/referral.module';
import { TypeDocumentModule } from './type-document/type-document.module';
import { ZoneModule } from './zone/zone.module';
import { CommissionModule } from './commission/commission.module';
import { DiscountModule } from './discount/discount.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { LocaleModule } from './locale/locale.module';
import { CommissionHistoryModule } from './commission-history/commission-history.module';
import { ParameterModule } from './parameter/parameter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      autoLoadEntities: true,
      synchronize: true,
    },),
    UserModule,
    AuthModule,
    RoleModule,
    ProductModule,
    GroupModule,
    ReferralModule,
    TypeDocumentModule,
    ZoneModule,
    CommissionModule,
    DiscountModule,
    PaymentMethodModule,
    ShoppingCartModule,
    LocaleModule,
    CommissionHistoryModule,
    ParameterModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
