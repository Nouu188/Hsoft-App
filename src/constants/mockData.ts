// src/constants/mockData.ts

export interface AppointmentCardData {
  id: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  image: string;
}

export const APPOINTMENT_DATA: AppointmentCardData[] = [
  {
    id: '1',
    doctorName: 'BS. Nguyễn Văn An',
    specialty: 'Khoa Tim Mạch',
    hospital: 'Bệnh viện Chợ Rẫy',
    date: '2025-08-20',
    time: '09:30',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '2',
    doctorName: 'BS. Trần Thị Bích',
    specialty: 'Khoa Nội Tiết',
    hospital: 'Bệnh viện Đại học Y Dược',
    date: '2025-08-22',
    time: '14:00',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '3',
    doctorName: 'BS. Lê Hoàng Cường',
    specialty: 'Khoa Chấn thương Chỉnh hình',
    hospital: 'Bệnh viện 115',
    date: '2025-08-25',
    time: '10:00',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '4',
    doctorName: 'BS. Phạm Thị Dung',
    specialty: 'Khoa Nhi',
    hospital: 'Bệnh viện Nhi Đồng 1',
    date: '2025-09-01',
    time: '08:00',
    image: 'https://images.unsplash.com/photo-1622253692010-33352da55eb4?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '5',
    doctorName: 'BS. Hoàng Văn Em',
    specialty: 'Khoa Mắt',
    hospital: 'Bệnh viện Mắt TP.HCM',
    date: '2025-09-05',
    time: '15:30',
    image: 'https://images.unsplash.com/photo-1605107597933-369b813b3b3a?q=80&w=2070&auto=format&fit=crop',
  },
];