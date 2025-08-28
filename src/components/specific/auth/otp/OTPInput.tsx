import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../../../constants/theme';
import type { OTPInputProps } from '../types';

// Component hiển thị các ô nhập OTP
const OTPInput: React.FC<OTPInputProps> = ({
  otp,              // mảng các ký tự OTP hiện tại
  inputRefs,        // mảng ref cho từng TextInput, dùng để focus
  handleOtpChange,  // callback khi nhập 1 ký tự
  handleKeyPress,   // callback khi nhấn phím (để xử lý backspace)
}) => {
  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={inputRefs[index]} 
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
    flexDirection: 'row',           // các ô nằm ngang
    justifyContent: 'space-between',// cách đều
    width: '100%',                   // chiếm hết chiều ngang
    marginBottom: SIZES.padding,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.textLight,  // viền mặc định
    borderRadius: SIZES.radius,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,    // đổi màu viền khi có giá trị
    backgroundColor: '#F3F8FF',     // nền nhạt khi có giá trị
  },
});

export default OTPInput;
