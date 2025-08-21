export interface HospitalDoctorDto {
  ma: string;       // Mã bác sĩ
  tenkp: string;    // Tên khoa phòng
  makp: string;
  hinhanh: string;  // URL ảnh
  hoten: string;    // Họ tên bác sĩ
  giobd: string;    // Giờ bắt đầu
  giokt: string;    // Giờ kết thúc
}

export interface FetchDoctorsResponse {
  dmbs: HospitalDoctorDto[];
}