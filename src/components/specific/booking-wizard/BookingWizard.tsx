// src/features/booking-wizard/BookingWizard.tsx
import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';

import WizardStepper from './WizardStepper';
import Step1_SelectHospital from './steps/step_1/Step1_Screen';
import { useBookingStore } from '@/store/useBookingStore';

// import Step2_SelectSchedule from './steps/Step2_SelectSchedule';
// import Step3_Confirmation from './steps/Step3_Confirmation';

const DEFAULT_STEPS = ['Chọn bệnh viện', 'Chọn lịch', 'Xác nhận'];

const BookingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const { data } = useBookingStore();

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(-currentStep * screenWidth) }],
  }));

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Nếu xong bước 1 thì cập nhật lại tên bước 2 theo hình thức khám
    if (currentStep === 0) {
      const step2 =
        data.bookingType === 'DOCTOR'
          ? 'Chọn lịch theo bác sỹ'
          : data.bookingType === 'CLINIC'
          ? 'Chọn lịch theo phòng khám'
          : 'Chọn lịch';
      setSteps(['Chọn bệnh viện', step2, 'Xác nhận']);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Submit booking...');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Nếu quay từ bước 2 về bước 1 thì reset lại STEPS mặc định
      if (currentStep === 1) {
        setSteps(DEFAULT_STEPS);
      }
      setCurrentStep(currentStep - 1);
    } else {
      // navigation.goBack();
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex > currentStep && !completedSteps.includes(currentStep)) {
      Alert.alert("Thông báo", "Vui lòng hoàn tất bước hiện tại.");
      return;
    }

    if (stepIndex < currentStep && completedSteps.includes(stepIndex)) {
      Alert.alert(
        "Xác nhận quay lại",
        "Thông tin ở các bước sau có thể sẽ bị xóa. Bạn có chắc muốn quay lại?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đồng ý",
            onPress: () => {
              setCompletedSteps(prev => prev.filter(s => s < stepIndex));
              setCurrentStep(stepIndex);
              if (stepIndex === 0) setSteps(DEFAULT_STEPS); // reset nếu quay lại đầu
            },
            style: "destructive",
          },
        ]
      );
      return;
    }

    setCurrentStep(stepIndex);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch khám</Text>
        <View style={{ width: 40 }} />
      </View>

      <WizardStepper steps={steps} currentStep={currentStep} />

      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.contentSlider, contentAnimatedStyle]}>
          {/* Step 1: Select Hospital */}
          <View style={{ width: screenWidth }}>
            <Step1_SelectHospital onNext={handleNext} />
          </View>

          {/* Step 2 */}
          {/* <View style={{ width: screenWidth }}>
            <Step2_SelectSchedule onNext={handleNext} onBack={handleBack} />
          </View> */}

          {/* Step 3 */}
          {/* <View style={{ width: screenWidth }}>
            <Step3_Confirmation onConfirm={handleNext} onBack={handleBack} />
          </View> */}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding / 2,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: SIZES.padding / 2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  contentWrapper: { flex: 1, overflow: 'hidden' },
  contentSlider: { flex: 1, flexDirection: 'row' },
});

export default BookingWizard;
