import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TenantManagementServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(TenantManagementServiceModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.port ?? 3005);
}
bootstrap();
