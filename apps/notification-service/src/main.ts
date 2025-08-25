import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe());
  
  const port = 3003;

  await app.listen(port);
}
bootstrap();