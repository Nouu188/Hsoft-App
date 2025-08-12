// src/components/specific/schedule/DoseItem.tsx (Đã nâng cấp)

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import DailySchedulePills from './DailySchedulePills';
import DoseActionMenu from '../../shared/DoseActionMenu';
import MealTimeSetter from './MealTimeSetter';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';
import { Dose } from '@/types/dtos/dose/dose.dto';
import { DoseStatus, MealRelation, MealRelationType } from '@/types';
import dayjs from 'dayjs';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SkipReasonModal from '../../shared/SkipReasonModal';

interface DoseItemProps {
  dose: Dose;
  allDosesForDay: GroupedDose[];
  onTogglePrepared: (doseId: string) => void;
  onNavigateToTime: (time: string) => void;
  onSkipDose: (doseId: string, reason: { category: string; detail?: string }) => void;
  onSetMealPreference: (doseId: string, preference: MealRelation | null) => void;
  onRescheduleDose: (doseId: string, newTime: string) => void;
}

const DoseItem: React.FC<DoseItemProps> = (props) => {
  const {
    dose,
    allDosesForDay,
    onTogglePrepared,
    onNavigateToTime,
    onSkipDose,
    onSetMealPreference,
    onRescheduleDose
  } = props;
  const [isSkipModalVisible, setSkipModalVisible] = useState(false);
  const handleSkipPress = () => {
    setSkipModalVisible(true);
  };

  const handleConfirmSkip = (reason: { category: string; detail?: string }) => {
    onSkipDose(dose.id, reason);
    setSkipModalVisible(false);
  };
  const [isMenuVisible, setMenuVisible] = useState(false);

  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'reschedule' | 'mealTime' | null>(null);

  const detectedMealType = useMemo((): MealRelationType | null => {
    const instructions = dose.usage_instructions?.toLowerCase() || '';
    if (instructions.includes('trước ăn')) return MealRelationType.BEFORE;
    if (instructions.includes('sau ăn')) return MealRelationType.AFTER;
    if (instructions.includes('trong bữa ăn')) return MealRelationType.WITH;
    return null;
  }, [dose.usage_instructions]);

  const handleConfirmTime = (selectedTime: Date) => {
    if (pickerMode === 'reschedule') {
      onRescheduleDose(dose.id, dayjs(selectedTime).toISOString());
    } else if (pickerMode === 'mealTime' && detectedMealType) {
      const doseTime = dayjs(dose.due_at);
      const mealTime = dayjs(selectedTime);
      const minutesDiff = Math.abs(doseTime.diff(mealTime, 'minute'));

      onSetMealPreference(dose.id, { type: detectedMealType, minutes: minutesDiff });
    }
    hideTimePicker();
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
    setPickerMode(null);
  };

  const showMealTimePicker = () => {
    if (!detectedMealType || detectedMealType === MealRelationType.WITH) {
      Alert.alert("Thông báo", "Chỉ có thể điều chỉnh thời gian cho 'Trước ăn' hoặc 'Sau ăn'.");
      return;
    }
    setPickerMode('mealTime');
    setTimePickerVisible(true);
  };

  const showReschedulePicker = () => {
    setPickerMode('reschedule');
    setTimePickerVisible(true);
  };

  const menuOptions = [
    { label: 'Xem lưu ý sử dụng', icon: 'document-text-outline', onPress: () => Alert.alert('Lưu ý', dose.usage_instructions || 'Không có lưu ý đặc biệt.') },
    ...(detectedMealType ? [{ label: 'Điều chỉnh giờ ăn', icon: 'restaurant-outline', onPress: showMealTimePicker }] : []),
    { label: 'Sửa giờ uống', icon: 'time-outline', onPress: showReschedulePicker },
    { label: 'Bỏ qua liều này', icon: 'close-circle-outline', onPress: handleSkipPress, isDestructive: true },
  ];

  const isTaken = dose.status === DoseStatus.TAKEN;
  const isUpcoming = dose.status === DoseStatus.UPCOMING;

  return (
    <View style={[styles.doseItemContainer, dose.is_prepared && !isTaken && !isUpcoming && styles.preparedItem]}>
      <View style={styles.doseItem}>
        {!isTaken && !isUpcoming ? (
          <TouchableOpacity onPress={() => onTogglePrepared(dose.id)} style={styles.checkbox}>
            <Ionicons name={dose.is_prepared ? "checkbox" : "square-outline"} size={24} color={dose.is_prepared ? COLORS.primary : COLORS.textLight} />
          </TouchableOpacity>
        ) : !isUpcoming ? (
          <Ionicons name="checkbox" style={styles.checkbox} size={24} color={COLORS.primary} />
        ) : (
          <Ionicons name="ellipse" style={styles.checkbox} size={24} color={COLORS.primary} />
        )}

        <View style={styles.doseInfo}>
          <Text style={[styles.medicationName]}>{dose.medication_name}</Text>
          <Text style={[styles.dosageText]}>{dose.dosage_instructions}</Text>

          <View style={styles.usageContainer}>
            {dose.usage_instructions && <Text style={[styles.usageText]}>{dose.usage_instructions}</Text>}
            {detectedMealType && (
              <MealTimeSetter doseStatus={dose.status} mealRelation={dose.meal_relation} onPress={showMealTimePicker} />
            )}
          </View>

          <DailySchedulePills
            currentDose={dose}
            allDosesForDay={allDosesForDay}
            onPillPress={onNavigateToTime}
          />
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textLight} />
        </TouchableOpacity>

      </View>

      <DoseActionMenu
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
        options={menuOptions as any}
        title={`Tùy chọn cho ${dose.medication_name}`}
      />

      <SkipReasonModal
        visible={isSkipModalVisible}
        onClose={() => setSkipModalVisible(false)}
        onConfirm={handleConfirmSkip}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
        title={pickerMode === 'reschedule' ? "Chọn giờ uống mới" : "Chọn giờ ăn"}
        date={new Date(dose.due_at)} // Giá trị mặc định của picker
        is24Hour={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  doseItemContainer: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: '#F1F5F9',
  },
  preparedItem: {
    opacity: 0.9,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: SIZES.padding / 1.5,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2
  },
  doseInfo: {
    flex: 1
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark
  },
  dosageText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  usageText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic'
  },
  menuButton: {
    padding: 8,
    paddingRight: 0,
  },
});


export default DoseItem;