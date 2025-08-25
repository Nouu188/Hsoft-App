import { NestFactory } from '@nestjs/core';
import { BillingServiceModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(BillingServiceModule);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
