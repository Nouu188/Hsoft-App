import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import dayjs from 'dayjs';
import { Dose, MealRelation, MealRelationType } from '@/types';

interface UseDoseItemProps {
  dose: Dose;
  onSkipDose: (doseId: string, reason: { category: string; detail?: string }) => void;
  onSetMealPreference: (doseId: string, preference: MealRelation | null) => void;
  onRescheduleDose: (doseId: string, newTime: string) => void;
}

export const useDoseItem = ({ dose, onSkipDose, onSetMealPreference, onRescheduleDose }: UseDoseItemProps) => {
  // --- State quản lý các Modal ---
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isSkipModalVisible, setSkipModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'reschedule' | 'mealTime' | null>(null);
  const [confirmationState, setConfirmationState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // --- Logic nghiệp vụ (được memoized) ---
  const detectedMealType = useMemo((): MealRelationType | null => {
    const instructions = dose.usage_instructions?.toLowerCase() || '';
    if (instructions.includes('trước ăn')) return MealRelationType.BEFORE;
    if (instructions.includes('sau ăn')) return MealRelationType.AFTER;
    if (instructions.includes('trong bữa ăn')) return MealRelationType.WITH;
    return null;
  }, [dose.usage_instructions]);

  // --- Handlers (được memoized) ---
  const handleConfirmTime = useCallback((selectedTime: Date) => {
    setTimePickerVisible(false);
    if (pickerMode === 'reschedule') {
      const newTimeISO = dayjs(selectedTime).toISOString();
      setConfirmationState({
        visible: true,
        title: "Xác nhận Sửa giờ",
        message: `Bạn có chắc muốn đổi giờ uống thuốc này thành ${dayjs(selectedTime).format('HH:mm')}?`,
        onConfirm: () => onRescheduleDose(dose.id, newTimeISO),
      });
    } else if (pickerMode === 'mealTime' && detectedMealType) {
      const doseTime = dayjs(dose.due_at);
      const mealTime = dayjs(selectedTime);
      const minutesDiff = Math.abs(doseTime.diff(mealTime, 'minute'));
      setConfirmationState({
        visible: true,
        title: "Xác nhận Giờ ăn",
        message: `Cài đặt này sẽ điều chỉnh thông báo uống thuốc ${detectedMealType === MealRelationType.BEFORE ? 'trước' : 'sau'} bữa ăn ${minutesDiff} phút. Bạn có chắc chắn?`,
        onConfirm: () => onSetMealPreference(dose.id, { type: detectedMealType, minutes: minutesDiff }),
      });
    }
    setPickerMode(null);
  }, [pickerMode, detectedMealType, dose.id, dose.due_at, onRescheduleDose, onSetMealPreference]);

  const showMealTimePicker = useCallback(() => {
    if (!detectedMealType || detectedMealType === MealRelationType.WITH) {
      Alert.alert("Thông báo", "Chỉ có thể điều chỉnh thời gian cho 'Trước ăn' hoặc 'Sau ăn'.");
      return;
    }
    setPickerMode('mealTime');
    setTimePickerVisible(true);
  }, [detectedMealType]);

  const showReschedulePicker = useCallback(() => {
    setPickerMode('reschedule');
    setTimePickerVisible(true);
  }, []);

  const handleConfirmSkip = useCallback((reason: { category: string; detail?: string }) => {
    onSkipDose(dose.id, reason);
    setSkipModalVisible(false);
  }, [dose.id, onSkipDose]);

  const menuOptions = useMemo(() => [
    { label: 'Xem lưu ý sử dụng', icon: 'document-text-outline', onPress: () => Alert.alert('Lưu ý', dose.usage_instructions || 'Không có lưu ý đặc biệt.') },
    ...(detectedMealType ? [{ label: 'Điều chỉnh giờ ăn', icon: 'restaurant-outline', onPress: showMealTimePicker }] : []),
    { label: 'Sửa giờ uống', icon: 'time-outline', onPress: showReschedulePicker },
    { label: 'Bỏ qua liều này', icon: 'close-circle-outline', onPress: () => setSkipModalVisible(true), isDestructive: true },
  ], [dose.usage_instructions, detectedMealType, showMealTimePicker, showReschedulePicker]);

  // --- Trả về một object chứa mọi thứ mà UI cần ---
  return {
    // States
    isMenuVisible,
    isSkipModalVisible,
    isTimePickerVisible,
    pickerMode,
    confirmationState,
    detectedMealType,
    // Handlers
    showMealTimePicker,
    setMenuVisible,
    setSkipModalVisible,
    handleConfirmSkip,
    setTimePickerVisible,
    handleConfirmTime,
    setConfirmationState,
    // Derived data
    menuOptions,
  };
};