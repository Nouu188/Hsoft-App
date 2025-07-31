import { NestFactory } from '@nestjs/core';
import { SchedulingServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(SchedulingServiceModule, { cors: true });
  const port = process.env.PORT ?? 3002;
  await app.listen(port);
}
bootstrap();
