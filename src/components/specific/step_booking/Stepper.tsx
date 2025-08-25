import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface StepperProps {
  currentStep: number;
  steps: string[];
  onStepPress: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps, onStepPress }) => {
  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={styles.touchableStep} // <-- STYLE NÀY ĐÃ ĐƯỢC THAY ĐỔI
              onPress={() => onStepPress(step)}
              disabled={!isCompleted && !isActive}
            >
              <View style={styles.stepContainer}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.completedCircle,
                    isActive && styles.activeCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepText,
                      (isCompleted || isActive) && styles.activeStepText,
                    ]}
                  >
                    {step}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.labelText,
                    isCompleted && styles.completedLabelText,
                    isActive && styles.activeLabelText,
                  ]}
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Đường kẻ nối sẽ hiển thị chính xác với style mới */}
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.line, // <-- STYLE NÀY ĐÃ ĐƯỢC THAY ĐỔI
                  isCompleted && styles.completedLine,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SIZES.padding*0.5,
  },
  // BỎ `flex: 1`. Bước sẽ chỉ chiếm không gian cần thiết.
  // Thêm padding để tạo khoảng cách chạm tốt hơn.
  touchableStep: {
    alignItems: 'center',
    paddingHorizontal: SIZES.base / 2, // Thêm một chút đệm ngang
  },
  stepContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // Thêm chiều rộng tối thiểu để các bước không bị quá sát nhau nếu tên ngắn
    minWidth: 60, 
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: COLORS.success,
  },
  activeCircle: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: COLORS.white,
  },
  labelText: {
    marginTop: SIZES.base / 2,
    textAlign: 'center',
    fontSize: SIZES.body5,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  completedLabelText: {
    color: COLORS.success,
  },
  activeLabelText: {
    color: COLORS.textLight,
  },
  // THAY ĐỔI LỚN: Gán `flex: 1` để đường kẻ tự động lấp đầy khoảng trống
  line: {
    flex: 1, // <-- QUAN TRỌNG NHẤT: Làm cho đường kẻ co giãn
    height: 2,
    backgroundColor: COLORS.border,
    // Bỏ marginHorizontal vì flex đã xử lý khoảng cách
    marginTop: 11, // Đẩy đường kẻ xuống để thẳng hàng với tâm vòng tròn
  },
  completedLine: {
    backgroundColor: COLORS.success,
  },
});

export default Stepper;