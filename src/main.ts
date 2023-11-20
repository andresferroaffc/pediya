import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const configSwagger = new DocumentBuilder()
    .setTitle('Tu pedido ya API')
    .addBearerAuth()
    .setDescription('Tu pedido ya API')
    .setVersion('1.0')
    .addTag('PediYa')
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('TuPedidoYaAPI', app, document);

  app.enableCors();

  console.log(process.env.PORT);

  await app.listen(process.env.PORT);
}
bootstrap();
