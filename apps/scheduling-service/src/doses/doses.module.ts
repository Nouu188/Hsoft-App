import { Module } from '@nestjs/common';
import { DosesService } from './doses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dose } from './entities/dose.entity';

@Module({
  providers: [DosesService],
  imports: [
    TypeOrmModule.forFeature([ Dose ])
  ]
})
export class DosesModule {}
