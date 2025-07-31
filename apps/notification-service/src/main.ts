import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  
  await app.init(); 
  console.log('Notification service is running and listening to RabbitMQ...');
}
bootstrap();