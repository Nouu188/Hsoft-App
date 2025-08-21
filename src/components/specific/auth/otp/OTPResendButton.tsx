import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../../../constants/theme'; // Điều chỉnh đường dẫn

interface OTPResendButtonProps {
  countdown: number;
  isResendDisabled: boolean;
  handleResend: () => void;
}

const OTPResendButton: React.FC<OTPResendButtonProps> = ({
  countdown,
  isResendDisabled,
  handleResend,
}) => {
  return (
    <View style={styles.resendContainer}>
      <TouchableOpacity onPress={handleResend} disabled={isResendDisabled}>
        <Text style={isResendDisabled ? styles.resendTextDisabled : styles.resendText}>
          {isResendDisabled ? `Gửi lại mã sau (${countdown}s)` : 'Gửi lại mã'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  resendContainer: {
    marginTop: SIZES.padding,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.text,
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    fontSize: 14,
    color: COLORS.textLight,
    opacity: 0.5,
  },
});

export default OTPResendButton;