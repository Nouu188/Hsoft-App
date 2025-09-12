import { HospitalPatient } from "@app/common/types";
import { CreateIdentityInput, Gender, Hospital } from "apps/tenant-management-service/src/domain";

export function normalizeHospitalPatient(
  patient: HospitalPatient,
  linkedHospitals?: Hospital[],
): CreateIdentityInput {
  if (!patient) {
    throw new Error('Cannot normalize null patient data');
  }

  const birthYear = patient.namsinh || undefined;
  const phoneNumber = patient.sodienthoai?.trim() || undefined;
  const nationalId = patient.socmnd?.trim() || undefined;
  const fullName = patient.hoten?.trim() || 'Unknown';
  const gender: Gender | undefined = undefined;

  const payload: CreateIdentityInput = {
    fullName,
    externalPatientCode: patient.mabn,
    gender,
    healthInsuranceNumber: undefined,
    phoneNumber,
    nationalId,
    address: undefined,
    birthYear,
    hospitals: linkedHospitals ?? [],
  };

  return payload;
}
