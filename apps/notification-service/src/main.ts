import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule, { cors: true });
  
  const port = 3003;

  await app.listen(port);

    if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();