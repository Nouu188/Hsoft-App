export interface Hospital {
  id: string;
  name: string;
  externalCode: string;
  images: string;

  // thêm trường để popup hiển thị chi tiết
  address?: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
}
export interface Step1_SelectHospitalProps {
  onNext: () => void;
}
