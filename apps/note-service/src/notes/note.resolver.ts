import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '@app/auth';
import { Note } from './entities/note.entity';
import { CreateNoteInput } from './dtos/create-note.input';
import { UpdateNoteInput } from './dtos/update-note.input';
import { NotesService } from './note.service';
import { User } from 'apps/account-service/src/users/entities/user.entity';

@Resolver(() => Note)
@UseGuards(JwtAuthGuard)
export class NotesResolver {
  constructor(private readonly notesService: NotesService) {}

  @Mutation(() => Note, { description: 'Create a new note for the authenticated user.' })
  async createNote(
    @Args('createNoteInput') createNoteInput: CreateNoteInput,
    @CurrentUser() user: User,
  ): Promise<Note> {
    return this.notesService.create(createNoteInput, user.id);
  }

  @Query(() => [Note], { name: 'notes', description: 'Get all notes of the authenticated user.' })
  async findAll(
    @CurrentUser() user: User,
  ): Promise<Note[]> {
    return this.notesService.findAll(user.id);
  }

  @Query(() => Note, { name: 'note', description: 'Get a specific note by ID (must belong to the user).' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Note> {
    return this.notesService.findOne(id, user.id);
  }

  @Mutation(() => Note, { description: 'Update a note (only if it belongs to the user).' })
  async updateNote(
    @Args('updateNoteInput') updateNoteInput: UpdateNoteInput,
    @CurrentUser() user: User,
  ): Promise<Note> {
    return this.notesService.update(updateNoteInput, user.id);
  }

  @Mutation(() => Boolean, { description: 'Remove a note (only if it belongs to the user).' })
  async removeNote(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.notesService.remove(id, user.id);
  }
}
