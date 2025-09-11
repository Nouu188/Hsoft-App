import { HospitalPatient } from "@app/common/types";
import { Hospital } from "apps/tenant-management-service/src/domain/hospitals/entities";
import { CreateIdentityInput } from "apps/tenant-management-service/src/domain/identities/dtos";
import { Gender } from "apps/tenant-management-service/src/domain/identities/entities";

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
