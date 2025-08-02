import { Module } from '@nestjs/common';
import { DosesService } from './doses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dose } from './entities/dose.entity';
import { DosesResolver } from './dose.resolver';

@Module({
  providers: [DosesService, DosesResolver],
  imports: [
    TypeOrmModule.forFeature([ Dose ])
  ]
})
export class DosesModule {}
