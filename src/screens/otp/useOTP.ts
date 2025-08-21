import { useState, useRef, useEffect } from 'react';
import { TextInput, Keyboard, Alert } from 'react-native';

interface UseOTPProps {
  otpLength?: number;
  initialCountdown?: number;
  onSubmit: (otp: string) => void;
}

export const useOTP = ({
  otpLength = 4,
  initialCountdown = 300,
  onSubmit,
}: UseOTPProps) => {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [countdown, setCountdown] = useState<number>(initialCountdown);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isResendDisabled]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);

    if (text && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (newOtp.every((digit) => digit !== '')) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!isResendDisabled) {
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi.');
      setCountdown(initialCountdown);
      setIsResendDisabled(true);
      setOtp(Array(otpLength).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === otpLength) {
      onSubmit(enteredOtp);
    } else {
      Alert.alert('Lỗi', `Vui lòng nhập đủ ${otpLength} số của mã OTP.`);
    }
  };

  return {
    otp,
    countdown,
    isResendDisabled,
    inputRefs,
    handleOtpChange,
    handleKeyPress,
    handleResend,
    handleSubmit,
  };
};