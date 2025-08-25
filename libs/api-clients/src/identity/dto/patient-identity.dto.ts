export interface PatientIdentity {
  id: string;
  userId: string;
  fullName: string;
  dob: string;
  gender: string;
  phoneNumber: string;
  email?: string;
  idCardNumber?: string;
  bhytNumber?: string;
  address?: string;
}

// DTO cho response của query
export interface GetMyIdentityResponse {
  myIdentity: PatientIdentity | null;
}