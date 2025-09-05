import { NestFactory } from '@nestjs/core';
import { OrchestratorServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(OrchestratorServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
