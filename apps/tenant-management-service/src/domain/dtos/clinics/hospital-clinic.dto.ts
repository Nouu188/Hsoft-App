import { Field, InputType } from "@nestjs/graphql";

export interface HospitalClinicDto {
  makp: string;
  tenkp: string;
}

@InputType()
export class HospitalClinicInput {
  @Field()
  makp: string;

  @Field()
  tenkp: string;
}