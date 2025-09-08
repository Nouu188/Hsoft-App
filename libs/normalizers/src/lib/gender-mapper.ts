import { Gender } from "apps/tenant-management-service/src/identities/entities/identity.entity";

export function mapHospitalGender(input?: string | null): Gender | undefined {
  if (!input) return undefined;

  const normalized = input.trim().toLowerCase();

  switch (normalized) {
    case 'nam':
    case 'male':
    case 'm':
    case '1':
      return Gender.MALE;

    case 'nữ':
    case 'nu':
    case 'female':
    case 'f':
    case '0':
      return Gender.FEMALE;

    case 'khác':
    case 'other':
    case 'o':
      return Gender.OTHER;

    default:
      return undefined; // fallback an toàn
  }
}