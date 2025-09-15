import { IQuery } from "@nestjs/cqrs";

export class GetIdentityFromHospitalQuery implements IQuery {
  constructor(
    public readonly phoneNumber: string,
    public readonly externalHospitalCode: string,
  ) {}
}
