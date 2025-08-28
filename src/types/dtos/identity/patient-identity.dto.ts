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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  hospitals?: {
    id: string;
    name: string;
    graphqlEndpoint?: string;
  }[];
}
