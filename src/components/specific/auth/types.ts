import { TextInput, KeyboardTypeOptions } from "react-native";

// Props cho component nhập OTP
export interface OTPInputProps {
  otp: string[]; // Mảng chứa từng ký tự của mã OTP
  inputRefs: React.RefObject<TextInput | null>[]; // Mảng ref để quản lý focus cho từng ô input
  handleOtpChange: (text: string, index: number) => void; // Callback khi người dùng nhập ký tự mới
  handleKeyPress: (e: any, index: number) => void; // Callback khi người dùng nhấn phím (dùng để xử lý backspace)
}

// Props cho nút gửi lại OTP
export interface OTPResendButtonProps {
  handleResend: () => void; // Hàm gọi khi nhấn gửi lại mã
  resetCountdown: () => void; // Hàm đặt lại thời gian đếm ngược sau khi gửi OTP
}

// Props cho input đa năng (AuthInput)
export interface AuthInputProps {
  icon: string; // Tên icon hiển thị bên trái
  placeholder: string; // Placeholder hiển thị khi input trống
  value: string; // Giá trị hiện tại của input
  onChangeText: (text: string) => void; // Callback khi người dùng nhập text
  isPassword?: boolean; // true nếu input là password (ẩn ký tự)
  error?: string; // Message lỗi hiển thị bên dưới input
  keyboardType?: KeyboardTypeOptions; // Loại bàn phím, ví dụ 'number-pad', 'email-address'
  isListPressed?: boolean; // true nếu muốn hiển thị dropdown list
  listItems?: string[]; // Danh sách item cho dropdown
  onSelectItem?: (item: string) => void; // Callback khi chọn một item trong dropdown
}
