import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendemailModule } from '../sendemail/sendemail.module';
import { Role, User } from '../shared/entity';
@Module({
  imports: [
    PassportModule,
    SendemailModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        algorithm: 'RS256',
        expiresIn: '60s',
      }),
    }),
    TypeOrmModule.forFeature([User, Role]),
  ],
  providers: [JwtStrategy, AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
