import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { NotesService } from './note.service';
import { NotesResolver } from './note.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note])
  ], 
  providers: [
    NotesResolver, 
    NotesService
  ],
})
export class NotesModule {}