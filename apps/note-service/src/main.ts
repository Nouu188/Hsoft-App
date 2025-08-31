import { NestFactory } from '@nestjs/core';
import { NoteServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(NoteServiceModule);
  await app.listen(process.env.port ?? 3006);
}
bootstrap();
