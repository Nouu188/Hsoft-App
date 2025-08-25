import { NestFactory } from '@nestjs/core';
import { SchedulingServiceModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(SchedulingServiceModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = 3002;

  await app.listen(port);
}
bootstrap();
