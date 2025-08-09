// src/components/specific/schedule/DoseItem.tsx (Đã nâng cấp)

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import DailySchedulePills from './DailySchedulePills';
import DoseActionMenu from '../../shared/DoseActionMenu';
import MealTimeSetter from './MealTimeSetter';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';
import { Dose, MealRelation } from '@/types/dtos/dose/dose.dto';

interface DoseItemProps {
  dose: Dose;
  time: string;
  allDosesForDay: GroupedDose[];
  onTogglePrepared: (doseId: string) => void;
  onNavigateToTime: (time: string) => void;
  onSkipDose: (doseId: string) => void;
  onSetMealPreference: (doseId: string, preference: MealRelation | null) => void;
}

const DoseItem: React.FC<DoseItemProps> = (props) => {
  const { dose, time, allDosesForDay, onTogglePrepared, onNavigateToTime, onSkipDose, onSetMealPreference } = props;
  const [isMenuVisible, setMenuVisible] = useState(false);

  const detectedMealType = useMemo((): 'BEFORE' | 'AFTER' | null => {
    const instructions = dose.usage_instructions?.toLowerCase() || '';
    if (instructions.includes('trước ăn')) return 'BEFORE';
    if (instructions.includes('sau ăn')) return 'AFTER';
    return null;
  }, [dose.usage_instructions]);

  const handleSetMealMinutes = () => {
    if (!detectedMealType) {
      Alert.alert("Thông báo", "Thuốc này không có chỉ định uống theo bữa ăn.");
      return;
    }

    Alert.alert(
      `Uống ${detectedMealType === 'BEFORE' ? 'trước' : 'sau'} ăn`,
      "Chọn khoảng thời gian:",
      [
        { text: "15 phút", onPress: () => onSetMealPreference(dose.id, { type: detectedMealType, minutes: 15 }) },
        { text: "30 phút", onPress: () => onSetMealPreference(dose.id, { type: detectedMealType, minutes: 30 }) },
        { text: "60 phút", onPress: () => onSetMealPreference(dose.id, { type: detectedMealType, minutes: 60 }) },
        { text: "Xóa cài đặt", onPress: () => onSetMealPreference(dose.id, null), style: 'destructive' },
        { text: "Hủy", style: 'cancel' },
      ]
    );
  };

  const menuOptions = [
    { label: 'Xem lưu ý sử dụng', icon: 'document-text-outline', onPress: () => Alert.alert('Lưu ý', dose.usage_instructions || 'Không có lưu ý đặc biệt.') },
    ...(detectedMealType ? [{ label: 'Điều chỉnh giờ ăn', icon: 'restaurant-outline', onPress: handleSetMealMinutes }] : []),
    { label: 'Sửa giờ uống', icon: 'time-outline', onPress: () => { /* Mở modal chọn giờ */ Alert.alert('Sắp ra mắt'); } },
    { label: 'Bỏ qua liều này', icon: 'close-circle-outline', onPress: () => Alert.alert('Xác nhận', 'Bạn có chắc muốn bỏ qua liều thuốc này?', [{ text: 'Hủy' }, { text: 'Xác nhận', onPress: () => onSkipDose(dose.id), style: 'destructive' }]), isDestructive: true },
  ];

  return (
    <View style={[styles.doseItemContainer]}>
      <View style={styles.doseItem}>
        <TouchableOpacity onPress={() => onTogglePrepared(dose.id)} style={styles.checkbox}>
          <Ionicons name={dose.is_prepared ? "checkbox" : "square-outline"} size={24} color={dose.is_prepared ? COLORS.primary : COLORS.textLight} />
        </TouchableOpacity>
        <View style={styles.doseInfo}>
          <View style={dose.is_prepared && styles.preparedItem}>
            <Text style={styles.medicationName}>{dose.medication_name}</Text>
            <Text style={styles.dosageText}>{dose.dosage_instructions}</Text>

            <View style={styles.usageContainer}>
              {dose.usage_instructions && <Text style={styles.usageText}>{dose.usage_instructions}</Text>}
              {detectedMealType && (
                <MealTimeSetter mealRelation={dose.meal_relation} onPress={handleSetMealMinutes} />
              )}
            </View>
          </View>

          <DailySchedulePills
            time={time}
            dose={dose}
            allDosesForDay={allDosesForDay}
            onPillPress={onNavigateToTime}
          />
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
      <DoseActionMenu visible={isMenuVisible} onClose={() => setMenuVisible(false)} options={menuOptions as any} />
    </View>
  );
};

const styles = StyleSheet.create({
  doseItemContainer: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, marginBottom: SIZES.padding / 4, overflow: 'hidden' },
  preparedItem: { opacity: 0.7 },
  doseItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  checkbox: { paddingRight: 10, paddingTop: 2 },
  doseInfo: { flex: 1 },
  medicationName: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  dosageText: { fontSize: 14, color: COLORS.textLight, marginTop: 2 },
  usageContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  usageText: { fontSize: 14, color: COLORS.textLight, fontStyle: 'italic' },
  menuButton: { padding: 8, marginLeft: 8, bottom: 2 },
});

export default DoseItem;