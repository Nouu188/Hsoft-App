// BookingWizard.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { BookingStackParamList } from '@/navigation/BookingWizardNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

import WizardStepper from './WizardStepper';
import Step1_SelectHospital from './steps/step_1/Step1_SelectHospital';
import Step2_SelectSchedule from './steps/step_2/Step2_SelectSchedule';
import Step3_Confirmation from './steps/step_3/Step3_Confirmation';
import { useBookingStore } from '@/store/useBookingStore';
import { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';

const DEFAULT_STEPS = ['Chọn bệnh viện', 'Chọn lịch', 'Xác nhận'];

const BookingWizard = () => {
  const route = useRoute<RouteProp<BookingStackParamList, 'BookingWizardMain'>>();
  const initialStep = route.params?.step ?? 0;
  const { prefilledDoctors = [] } = route.params || {};
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: screenWidth } = useWindowDimensions();
  const { data } = useBookingStore();

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [scrollToEntityId, setScrollToEntityId] = useState<string | undefined>(undefined);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(-currentStep * screenWidth, { duration: 300 }) }],
  }));

  const updateStepsForBookingType = useCallback(() => {
    const step2 =
      data.bookingType === 'DOCTOR'
        ? 'Chọn lịch theo bác sĩ'
        : data.bookingType === 'CLINIC'
        ? 'Chọn lịch theo phòng khám'
        : 'Chọn lịch';
    setSteps(['Chọn bệnh viện', step2, 'Xác nhận']);
  }, [data.bookingType]);

  const handleNext = useCallback(() => {
    const { isStepValid } = useBookingStore.getState();

    if (!isStepValid(currentStep)) {
      Alert.alert('Thông báo', 'Vui lòng hoàn tất bước hiện tại trước khi sang bước tiếp theo.');
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));

    if (currentStep === 0) updateStepsForBookingType();

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert('Thông báo', 'Bạn đã hoàn tất đặt lịch!');
    }
  }, [currentStep, steps, updateStepsForBookingType]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      if (currentStep === 1) setSteps(DEFAULT_STEPS);
      setCurrentStep(currentStep - 1);
    } else {
      Alert.alert('Thoát', 'Bạn có chắc muốn thoát đặt lịch?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
    }
  }, [currentStep, navigation]);

  const handleBackFromStep3 = useCallback((entity?: Entity) => {
    if (entity) setScrollToEntityId(entity.id);
    setCurrentStep(1); // quay về Step2
  }, []);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex > currentStep && !completedSteps.has(currentStep)) {
        Alert.alert('Thông báo', 'Vui lòng hoàn tất bước hiện tại.');
        return;
      }
      if (stepIndex < currentStep) {
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
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch khám</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="home-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* Stepper */}
      <WizardStepper steps={steps} currentStep={currentStep} goToStep={goToStep} />

      {/* Content Slider */}
      <View style={styles.contentWrapper}>
        <Animated.View
          style={[
            { flexDirection: 'row', width: screenWidth * steps.length, flex: 1, alignItems: 'stretch' },
            contentAnimatedStyle,
          ]}
        >
          <StepWrapperStep1 onNext={handleNext} screenWidth={screenWidth} />
          <StepWrapperStep2
            scheduleType={data.bookingType === 'DOCTOR' ? 'doctor' : 'clinic'}
            onNext={handleNext}
            onBack={handleBack}
            screenWidth={screenWidth}
            prefilledDoctors={prefilledDoctors}
            scrollToEntityId={scrollToEntityId}
          />
          <StepWrapperStep3 onConfirm={handleNext} onBack={handleBackFromStep3} screenWidth={screenWidth} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default BookingWizard;

// --- Wrappers ---
const StepWrapperStep1 = ({ onNext, screenWidth }: { onNext: () => void; screenWidth: number }) => (
  <Animated.FlatList
    data={[0]}
    keyExtractor={() => 'step1'}
    renderItem={() => <Step1_SelectHospital onNext={onNext} />}
    style={{ width: screenWidth }}
    contentContainerStyle={{ flexGrow: 1, paddingTop: SIZES.padding }}
    showsVerticalScrollIndicator={false}
  />
);

const StepWrapperStep2 = ({
  scheduleType,
  onNext,
  onBack,
  screenWidth,
  prefilledDoctors,
  scrollToEntityId,
}: {
  scheduleType: 'doctor' | 'clinic';
  onNext: () => void;
  onBack: (entity?: Entity) => void;
  screenWidth: number;
  prefilledDoctors?: { doctorId: string; selectedTime: string }[];
  scrollToEntityId?: string;
}) => (
  <Animated.View style={{ width: screenWidth }}>
    <Step2_SelectSchedule
      scheduleType={scheduleType}
      onNext={onNext}
      onBack={onBack}
      prefilledDoctors={prefilledDoctors}
      scrollToEntityId={scrollToEntityId}
    />
  </Animated.View>
);

const StepWrapperStep3 = ({ onConfirm, onBack, screenWidth }: { onConfirm: () => void; onBack: (entity?: Entity) => void; screenWidth: number }) => (
  <Animated.FlatList
    data={[0]}
    keyExtractor={() => 'step3'}
    renderItem={() => <Step3_Confirmation onBack={onBack} />}
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
});
