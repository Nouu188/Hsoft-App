import { NestFactory } from '@nestjs/core';
import { AppointmentServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppointmentServiceModule);
  await app.listen(process.env.port ?? 3004);
}
bootstrap();
