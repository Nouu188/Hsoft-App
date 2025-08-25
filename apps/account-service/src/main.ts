import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AccountServiceModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AccountServiceModule);

  app.useGlobalPipes(new ValidationPipe());
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
}
bootstrap();
