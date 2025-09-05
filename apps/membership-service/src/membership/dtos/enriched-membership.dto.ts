import { Membership, MembershipClinic, MembershipDoctor, MembershipHospital } from "../entities";

export type EnrichedMembership = Membership & {
  assignedHospitals: MembershipHospital[];
  assignedClinics: MembershipClinic[];
  assignedDoctors: MembershipDoctor[];
};