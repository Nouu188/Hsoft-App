import { ICommand } from '@nestjs/cqrs';
import { BookByClinicInput } from 'apps/appointment-service/src/domain';

export class BookByClinicCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly inputs: BookByClinicInput[],
  ) {}
}
