import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';

interface Step2Props {
  onNext: () => void;
  onBack?: () => void;
}

const Step2_SelectSchedule: React.FC<Step2Props> = ({ onNext, onBack }) => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Nội dung */}
      <View style={styles.content}>
        <Text style={styles.title}>Chọn lịch khám</Text>
        <Text style={styles.subTitle}>
          Bạn có thể chọn lịch theo bác sỹ hoặc phòng khám (tùy thuộc hình thức đã chọn).
        </Text>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={onNext}>
          <Text style={[styles.buttonText, { color: COLORS.white }]}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
   
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SIZES.padding,
    paddingBottom:SIZES.padding*5
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginLeft: 12,
  },
  backButton: {
    backgroundColor: COLORS.lightGray,
  },
  nextButton: {
    backgroundColor: COLORS.lightBlue,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Step2_SelectSchedule;