import { NestFactory } from '@nestjs/core';
import { TenantManagementServiceModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(TenantManagementServiceModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.port ?? 3005);
}
bootstrap();
