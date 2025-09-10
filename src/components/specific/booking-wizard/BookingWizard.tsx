// src/features/booking-wizard/BookingWizard.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';

import WizardStepper from './WizardStepper';
import Step1_SelectHospital from './steps/step_1/Step1_Screen';
import Step2_SelectSchedule from './steps/step_2/Step2_SelectSchedule';
import Step3_Confirmation from './steps/step_3/Step3_Confirmation';
import { useBookingStore } from '@/store/useBookingStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types'; // import type đúng của bạn
const DEFAULT_STEPS = ['Chọn bệnh viện', 'Chọn lịch', 'Xác nhận'];

const BookingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const { data } = useBookingStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Slide animation
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(-currentStep * screenWidth, { duration: 300 }) }],
  }));

  // Cập nhật label Step 2 theo bookingType
  const updateStepsForBookingType = useCallback(() => {
    const step2 =
      data.bookingType === 'DOCTOR'
        ? 'Chọn lịch theo bác sỹ'
        : data.bookingType === 'CLINIC'
          ? 'Chọn lịch theo phòng khám'
          : 'Chọn lịch';
    setSteps(['Chọn bệnh viện', step2, 'Xác nhận']);
  }, [data.bookingType]);

  const handleNext = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep === 0) updateStepsForBookingType();
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else Alert.alert('Thông báo', 'Bạn đã hoàn tất đặt lịch!');
  }, [currentStep, steps, updateStepsForBookingType]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      if (currentStep === 1) setSteps(DEFAULT_STEPS);
      setCurrentStep(currentStep - 1);
    } else {
      Alert.alert('Thoát', 'Bạn có chắc muốn thoát đặt lịch?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', style: 'destructive', onPress: () => console.log('Go back') },
      ]);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex > currentStep && !completedSteps.has(currentStep)) {
        Alert.alert('Thông báo', 'Vui lòng hoàn tất bước hiện tại.');
        return;
      }
      if (stepIndex < currentStep && completedSteps.has(stepIndex)) {
        Alert.alert(
          'Xác nhận quay lại',
          'Thông tin ở các bước sau có thể sẽ bị xóa. Bạn có chắc muốn quay lại?',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Đồng ý',
              onPress: () => {
                setCompletedSteps(prev => {
                  const newSet = new Set<number>();
                  for (const s of prev) if (s < stepIndex) newSet.add(s);
                  return newSet;
                });
                setCurrentStep(stepIndex);
                if (stepIndex === 0) setSteps(DEFAULT_STEPS);
              },
              style: 'destructive',
            },
          ]
        );
        return;
      }
      setCurrentStep(stepIndex);
    },
    [currentStep, completedSteps]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {/* Nút back */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>

        {/* Tiêu đề */}
        <Text style={styles.headerTitle}>Đặt lịch khám</Text>

        {/* Nút Home */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* Stepper */}
      <WizardStepper steps={steps} currentStep={currentStep} goToStep={goToStep} />

      {/* Content Slider */}
      {/* Content Slider */}
      <View style={styles.contentWrapper}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              width: screenWidth * steps.length, // Mỗi step chiếm screenWidth
            },
            contentAnimatedStyle,
          ]}
        >
          {/* Step 1 */}
          <Step1_SelectHospitalWrapper onNext={handleNext} screenWidth={screenWidth} />

          {/* Step 2 */}
          <ScrollView
            style={{ width: screenWidth }}
            contentContainerStyle={{ flexGrow: 1, padding: SIZES.padding }}
            showsVerticalScrollIndicator={false}
          >
            <Step2_SelectSchedule onNext={handleNext} onBack={handleBack} />
          </ScrollView>

          {/* Step 3 */}
          <Step3_ConfirmationWrapper
            onConfirm={handleNext}
            onBack={handleBack}
            screenWidth={screenWidth}
          />
        </Animated.View>
      </View>

    </SafeAreaView>
  );
};

// Wrappers Step1 & Step3 để dùng FlatList scroll độc lập
const Step1_SelectHospitalWrapper = ({ onNext, screenWidth }: { onNext: () => void; screenWidth: number }) => (
  <Animated.FlatList
    data={[0]} // chỉ render duy nhất nội dung Step1
    keyExtractor={item => 'step1'}
    renderItem={() => <Step1_SelectHospital onNext={onNext} />}
    style={{ width: screenWidth }}
    contentContainerStyle={{ flexGrow: 1, paddingTop: SIZES.padding }}
    showsVerticalScrollIndicator={false}
  />
);

const Step3_ConfirmationWrapper = ({ onConfirm, onBack, screenWidth }: { onConfirm: () => void; onBack: () => void; screenWidth: number }) => (
  <Animated.FlatList
    data={[0]} // chỉ render duy nhất Step3
    keyExtractor={item => 'step3'}
    renderItem={() => <Step3_Confirmation onConfirm={onConfirm} onBack={onBack} />}
    style={{ width: screenWidth }}
    contentContainerStyle={{ flexGrow: 1 }}
    showsVerticalScrollIndicator={false}
  />
);

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
