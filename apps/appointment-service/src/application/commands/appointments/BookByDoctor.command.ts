import { ICommand } from '@nestjs/cqrs';
import { BookByDoctorInput } from 'apps/appointment-service/src/domain';

export class BookByDoctorCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly inputs: BookByDoctorInput[],
  ) {}
}
