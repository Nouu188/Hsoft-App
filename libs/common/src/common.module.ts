import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: './libs/common/.env.local',
    }),
  ],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
