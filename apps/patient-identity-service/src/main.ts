import { NestFactory } from '@nestjs/core';
import { PatientIdentityServiceModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(PatientIdentityServiceModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.port ?? 3006);
}
bootstrap();
