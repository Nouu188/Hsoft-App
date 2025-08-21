import { NestFactory } from '@nestjs/core';
import { BillingServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(BillingServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
