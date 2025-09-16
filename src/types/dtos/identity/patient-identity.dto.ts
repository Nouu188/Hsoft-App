export interface Identity {
  id: string;
  fullName: string;
  externalPatientCode?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phoneNumber?: string;
  nationalId?: string;
  healthInsuranceNumber?: string;
  address?: string;
  birthYear?: number;
  hospitals?: {
    id: string;
    name: string;
    externalCode?: string;
  }[];
}
