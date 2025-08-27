import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Alert } from 'react-native';
import { COLORS, SIZES } from '../../../../constants/theme';

interface OTPResendButtonProps {
  handleResend: () => void;
  resetCountdown: () => void;
}

const OTPResendButton: React.FC<OTPResendButtonProps> = ({ handleResend, resetCountdown }) => {
  const [resendCount, setResendCount] = useState(0);
  const MAX_RESEND = 5;

  const onPress = () => {
    if (resendCount >= MAX_RESEND) return;
    handleResend();
    resetCountdown();
    setResendCount(prev => prev + 1);
    Alert.alert('Đã gửi', 'Mã OTP mới đã được gửi tới email của bạn.');
  };

  const isDisabled = resendCount >= MAX_RESEND;

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
  resendContainer: { marginTop: SIZES.padding, flexDirection: 'row' },
  textNormal: { fontSize: 14, color: COLORS.text },
  resendText: { fontSize: 14, color: COLORS.text, textDecorationLine: 'underline' },
  resendTextDisabled: { fontSize: 14, color: COLORS.textLight, opacity: 0.5, textDecorationLine: 'underline' },
});

export default OTPResendButton;
