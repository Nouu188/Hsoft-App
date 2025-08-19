import { NestFactory } from '@nestjs/core';
import { SchedulingServiceModule } from './app.module';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(SchedulingServiceModule, { cors: true });

  const configService = app.get(ConfigService);
  const port = 3002;

  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
