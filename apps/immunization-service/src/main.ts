import { NestFactory } from '@nestjs/core';
import { ImmunizationServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ImmunizationServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
