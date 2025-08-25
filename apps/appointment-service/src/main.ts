import { NestFactory } from '@nestjs/core';
import { AppointmentServiceModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppointmentServiceModule);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.port ?? 3004);
}
bootstrap();
