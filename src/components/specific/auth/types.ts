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

export interface AuthInputProps {
  icon?: string;
  placeholder?: string;
  value: string;
  isPassword?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  isListPressed?: boolean;
  listItems?: Array<{ label: string; value: string }>;
  isLoading?: boolean;
  autoFocus?: boolean;
  autoCorrect?: boolean;
  onSelectItem?: (item: string) => void;
  onChangeText: (text: string) => void;
}
