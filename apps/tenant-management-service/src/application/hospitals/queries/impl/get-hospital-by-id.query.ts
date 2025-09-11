import { IQuery } from "@nestjs/cqrs";

export class GetHospitalByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}