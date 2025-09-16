import { Gender, MedicalServicePrice } from "apps/tenant-management-service/src/domain";

export interface HospitalDoctorGraphQLDto {
  ma: string;
  makp: string;
  tenkp: string;
  thongbao: string | null;
  hoten: string;
  bacsy: string;
  workername: string | null;
  pin: string;
  hienpin: string; // '0' hoặc '1'
  hinhanh: string | null;
  kinhnghiem: string | null;
  phai: string; // '0' hoặc '1'
  mavp: string;
  tenvp: string;
  gia_th: string;
  gia_bh: string;
  gia_dv: string;
  gia_cs: string;
  gia_nn: string;
  gia_ksk: string;
  bhyt: string; // '1.0'
  chenhlech: string;
  makpcl: string | null;
  benhvien: string;
  giobd: string;
  giokt: string;
}

export interface FetchDoctorsResponse {
  dmbsdangkykham: HospitalDoctorGraphQLDto[];
}