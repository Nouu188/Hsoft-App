// Định nghĩa cấu trúc dữ liệu cho toàn bộ màn hình
// Theo dõi tiến độ uống thuốc trong ngày
export type DailyProgress = { 
  taken: number; // số viên đã uống
  total: number; // tổng số viên cần uống
};

// Thông tin 1 loại thuốc
export type Medication = { 
  name: string;         // tên thuốc
  frequency: string;    // tần suất uống (vd: "3 lần/ngày")
  taken: number;        // số viên đã uống
  total: number;        // tổng số viên
  color: string;        // màu nền icon thuốc
  progressColor: string;// màu thanh tiến độ
  iconColor: string;    // màu viên thuốc bên trong icon
};

// Thống kê (StatCard)
export type Statistic = { 
  value: string;    // giá trị hiển thị (vd: "5")
  label: string;    // nhãn mô tả (vd: "Viên đã uống")
  hasIcon: boolean; // có hiển thị icon checkmark không
};

// ==========================
// Props cho component con
// ==========================

// Props cho vòng tròn tiến độ
export type CircularProgressProps = { 
  value: number;       // số viên đã uống
  total: number;       // tổng số viên
  size?: number;       // đường kính vòng tròn, mặc định 160
  strokeWidth?: number;// độ dày vòng tròn, mặc định 12
};

// Props cho thanh tiến độ ngang
export type ProgressBarProps = { 
  progress: number;    // % tiến độ (0-100)
  color?: string;      // màu fill, mặc định '#60A5FA'
  backgroundColor?: string; // màu nền, mặc định '#EFF6FF'
};

// Props cho thẻ thuốc
export type MedicationCardProps = { 
  medication: Medication; // dữ liệu 1 loại thuốc
};

// Props cho thẻ thống kê
export type StatCardProps = { 
  stat: Statistic;        // dữ liệu 1 thống kê
};

// ==========================
// Props cho SegmentedControl
// ==========================
export interface SegmentedControlProps {
  options: string[];                  // Danh sách lựa chọn hiển thị
  selectedOption: string;             // Giá trị đang được chọn
  onSelect: (option: string) => void; // Callback khi chọn 1 option
}