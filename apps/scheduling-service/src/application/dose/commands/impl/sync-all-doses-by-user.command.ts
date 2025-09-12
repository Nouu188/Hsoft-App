export class SyncAllDosesByUserCommand {
  constructor(
    public readonly userId: string,
    public readonly hospitalUrl: string,
  ) {}
}
