export interface HospitalClinicDto {
  makp: string;
  tenkp: string;
}

export interface FetchClinicsResponse {
  btdkp: HospitalClinicDto[];
}