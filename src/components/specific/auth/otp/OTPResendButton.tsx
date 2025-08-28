import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS, SIZES } from '../../../../constants/theme';
import type { OTPResendButtonProps } from '../types';

// Component nút "Gửi lại mã OTP"
const OTPResendButton: React.FC<OTPResendButtonProps> = ({ handleResend, resetCountdown }) => {
  const [resendCount, setResendCount] = useState(0); // số lần đã gửi lại
  const MAX_RESEND = 5; // giới hạn số lần gửi lại

  // Hàm xử lý khi bấm nút gửi lại
  const onPress = () => {
    if (resendCount >= MAX_RESEND) return; // không cho gửi nếu đạt giới hạn
    handleResend();        // gọi hàm gửi lại OTP từ props
    resetCountdown();      // reset countdown hiển thị
    setResendCount(prev => prev + 1); // tăng số lần gửi
    Alert.alert('Đã gửi', 'Mã OTP mới đã được gửi tới email của bạn.');
  };

  const isDisabled = resendCount >= MAX_RESEND; // xác định trạng thái disable

  return (
    <View style={styles.resendContainer}>
      <Text style={styles.textNormal}>Bạn chưa nhận được mã? </Text>
      <TouchableOpacity onPress={onPress} disabled={isDisabled}>
        <Text style={isDisabled ? styles.resendTextDisabled : styles.resendText}>
          Gửi lại mã {resendCount > 0 ? `(${resendCount}/${MAX_RESEND})` : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  resendContainer: { 
    marginTop: SIZES.padding, 
    flexDirection: 'row', // chữ và nút nằm ngang
  },
  textNormal: { 
    fontSize: 14, 
    color: COLORS.text, 
  },
  resendText: { 
    fontSize: 14, 
    color: COLORS.text, 
    textDecorationLine: 'underline', // gạch chân
  },
  resendTextDisabled: { 
    fontSize: 14, 
    color: COLORS.textLight, 
    opacity: 0.5, 
    textDecorationLine: 'underline', 
  },
});

export default OTPResendButton;
