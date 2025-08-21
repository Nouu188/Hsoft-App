import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../../constants/theme'; // Điều chỉnh đường dẫn

interface OTPInputProps {
  otp: string[];
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleOtpChange: (text: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({
  otp,
  inputRefs,
  handleOtpChange,
  handleKeyPress,
}) => {
  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleOtpChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          value={digit}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SIZES.padding,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: SIZES.radius,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3F8FF',
  },
});

export default OTPInput;