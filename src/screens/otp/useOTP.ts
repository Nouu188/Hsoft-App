import { useState, useEffect, createRef } from 'react';
import { TextInput, Keyboard, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types'; // đổi theo project của bạn

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UseOTPProps {
  otpLength?: number;
  initialCountdown?: number;
  onSubmit: (otp: string) => void;
  onResend?: () => Promise<void>;
  navigation: NavigationProp;
}

export interface UseOTPReturnType {
  otp: string[];
  countdown: number;
  formattedCountdown: string;
  isResendDisabled: boolean;
  inputRefs: React.RefObject<TextInput | null>[];
  handleOtpChange: (text: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
  handleResend: () => void;
  handleSubmit: () => void;
  resetCountdown: () => void;
  clearOTP: () => void;
}

export const useOTP = ({
  otpLength = 4,
  initialCountdown = 300,
  onSubmit,
  onResend,
  navigation,
}: UseOTPProps): UseOTPReturnType => {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [countdown, setCountdown] = useState<number>(initialCountdown);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);

  // Tạo mảng ref cho từng ô OTP
  const inputRefs = Array(otpLength)
    .fill(null)
    .map(() => createRef<TextInput>());

  const [formattedCountdown, setFormattedCountdown] = useState('');

  // --- Countdown tự chạy ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetCountdown = () => {
    setCountdown(initialCountdown);
    setIsResendDisabled(true);
  };

  // --- Định dạng MM:SS ---
  useEffect(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    setFormattedCountdown(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  }, [countdown]);

  // --- Nhập OTP ---
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    if (text.length > 1) {
      const chars = text.slice(0, otpLength - index).split('');
      chars.forEach((c, i) => {
        newOtp[index + i] = c;
      });
      setOtp(newOtp);
      const lastIndex = Math.min(index + chars.length, otpLength - 1);
      inputRefs[lastIndex].current?.focus();
      if (newOtp.every(d => d !== '')) Keyboard.dismiss();
      return;
    }
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < otpLength - 1) inputRefs[index + 1].current?.focus();
    if (newOtp.every(d => d !== '')) Keyboard.dismiss();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // --- Resend OTP ---
  const handleResend = async () => {
    if (isResendDisabled) return;
    try {
      if (onResend) await onResend();
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi.');
      resetCountdown();
      setOtp(Array(otpLength).fill(''));
      inputRefs[0].current?.focus();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    }
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === otpLength) {
      onSubmit(enteredOtp); // ✅ để screen xử lý navigate hoặc logic
    } else {
      Alert.alert('Lỗi', `Vui lòng nhập đủ ${otpLength} số của mã OTP.`);
    }
  };

  const clearOTP = () => {
    setOtp(Array(otpLength).fill(''));
    inputRefs[0].current?.focus();
  };

  return {
    otp,
    countdown,
    formattedCountdown,
    isResendDisabled,
    inputRefs,
    handleOtpChange,
    handleKeyPress,
    handleResend,
    handleSubmit,
    resetCountdown,
    clearOTP,
  };
};
