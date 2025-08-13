import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule, { cors: true });
  
  const port = 3003;

  await app.listen(port);
  console.log('Notification service is running and listening to RabbitMQ...');
}
bootstrap();