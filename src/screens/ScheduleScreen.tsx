// src/screens/ScheduleScreen.tsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import dayjs from 'dayjs';

import { COLORS, SIZES } from '../constants/theme';
import { useScheduleStore } from '../store/useScheduleStore';
import { Dose } from '../types';

// --- Component con: DateSelector ---
const DateSelector: React.FC = () => {
  const selectedDate = useScheduleStore(state => state.selectedDate);
  const setSelectedDate = useScheduleStore(state => state.setSelectedDate);

  const dates = useMemo(() => {
    const startPoint = selectedDate.subtract(3, 'day');
    return Array.from({ length: 7 }).map((_, i) => startPoint.add(i, 'day'));
  }, [selectedDate]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelectorContainer}>
      {dates.map((date, index) => {
        const isActive = date.isSame(selectedDate, 'day');
        return (
          <TouchableOpacity 
            key={index} 
            style={[styles.dateButton, isActive && styles.dateButtonActive]}
            onPress={() => setSelectedDate(date)}
          >
            {isActive && <View style={styles.dot} />}
            <Text style={[styles.dateNumber, isActive && styles.dateTextActive]}>{date.format('D')}</Text>
            <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{date.format('ddd')}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// --- Component con: DoseCard ---
const DoseCard: React.FC<{ dose: Dose }> = ({ dose }) => {
  const updateDoseStatus = useScheduleStore(state => state.updateDoseStatus);
  const isTaken = dose.status === 'TAKEN';
  const isSkipped = dose.status === 'SKIPPED';
  const isPending = dose.status === 'PENDING';
  const isPastDue = dayjs().isAfter(dayjs(dose.due_at));

  const handleUpdateStatus = (newStatus: 'TAKEN' | 'SKIPPED') => {
    // Chỉ cho phép cập nhật nếu trạng thái hiện tại khác
    if (dose.status !== newStatus) {
      updateDoseStatus(dose.id, newStatus);
    }
  };

  return (
    <View style={[styles.medCard, (isTaken || isSkipped) && styles.medCardCompleted]}>
      <View style={styles.medCardHeader}>
        <Text style={styles.medTitle}>{dose.medication_name}</Text>
        <View style={styles.timeContainer}>
          <Ionicons name="alarm-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.timeText}>{dayjs(dose.due_at).format('h:mm A')}</Text>
        </View>
      </View>
      <Text style={styles.medSubtitle}>{dose.dosage_instructions}</Text>
      {dose.usage_instructions && <Text style={styles.medUsage}>{dose.usage_instructions}</Text>}
      
      <View style={styles.medCardActions}>
        <TouchableOpacity 
          style={[styles.actionChip, isSkipped && styles.actionChipSkipped]}
          onPress={() => handleUpdateStatus('SKIPPED')}
        >
          <Ionicons name="close-outline" size={20} color={isSkipped ? COLORS.white : COLORS.danger} />
          <Text style={[styles.actionChipText, isSkipped && styles.actionChipTextActive]}>Bỏ qua</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionChip, isTaken && styles.actionChipTaken]}
          onPress={() => handleUpdateStatus('TAKEN')}
        >
          <Ionicons name="checkmark-outline" size={20} color={isTaken ? COLORS.white : COLORS.success} />
          <Text style={[styles.actionChipText, isTaken && styles.actionChipTextActive]}>Đã uống</Text>
        </TouchableOpacity>
      </View>
      {isPending && isPastDue && <View style={styles.missedIndicator} />}
    </View>
  );
};

// --- Component con: DoseList ---
const DoseList: React.FC = () => {
  const { dosesForDay, isLoading, error } = useScheduleStore();

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.centeredMessage} />;
  }
  if (error) {
    return <Text style={[styles.centeredMessage, styles.errorText]}>Lỗi: {error}</Text>;
  }
  if (dosesForDay.length === 0) {
    return <Text style={[styles.centeredMessage, styles.emptyText]}>Không có lịch uống thuốc cho ngày này.</Text>;
  }

  return (
    <View style={styles.medCardContainer}>
      {dosesForDay.map(dose => (
        <DoseCard key={dose.id} dose={dose} />
      ))}
    </View>
  );
};

// --- Màn hình chính ---
const ScheduleScreen: React.FC = () => {
  const { selectedDate, fetchDosesForDate, isLoading } = useScheduleStore();
  // TODO: Lấy user từ một store auth
  const user = { id: 'user-id-placeholder', name: 'Lina' };

  useEffect(() => {
    if (user.id) {
      fetchDosesForDate(user.id, selectedDate);
    }
  }, [user.id, selectedDate, fetchDosesForDate]);

  const onRefresh = () => {
    if (user.id) {
      fetchDosesForDate();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Chào buổi sáng, {user.name}!</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Lịch */}
        <Text style={styles.sectionTitle}>Lịch trình của bạn</Text>
        <DateSelector />

        {/* Danh sách liều uống */}
        <DoseList />
        
      </ScrollView>
      {/* Nút thêm mới (nếu cần) */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingTop: SIZES.padding, marginBottom: SIZES.padding / 2 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark },
  notificationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, paddingHorizontal: SIZES.padding, marginBottom: SIZES.padding },
  dateSelectorContainer: { paddingHorizontal: SIZES.padding, paddingBottom: SIZES.padding },
  dateButton: { backgroundColor: COLORS.white, borderRadius: 25, paddingVertical: 12, paddingHorizontal: 18, marginRight: 10, alignItems: 'center', minWidth: 60, borderWidth: 1, borderColor: '#E2E8F0' },
  dateButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dot: { position: 'absolute', top: 8, width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.white },
  dateNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4 },
  dateDay: { fontSize: 14, color: COLORS.textLight },
  dateTextActive: { color: COLORS.white },
  medCardContainer: { paddingHorizontal: SIZES.padding },
  medCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius * 1.5, padding: SIZES.padding, marginBottom: SIZES.padding, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  medCardCompleted: { backgroundColor: '#F8F9FA', opacity: 0.8 },
  medCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.padding / 2 },
  medTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textDark, flex: 1 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: SIZES.radius },
  timeText: { marginLeft: 5, color: COLORS.textDark, fontWeight: '500' },
  medSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  medUsage: { fontSize: 14, color: COLORS.textDark, marginTop: 8, fontStyle: 'italic' },
  medCardActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: SIZES.padding, gap: 10 },
  actionChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  actionChipText: { marginLeft: 6, fontWeight: '600' },
  actionChipTaken: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  actionChipSkipped: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  actionChipTextActive: { color: COLORS.white },
  missedIndicator: { position: 'absolute', top: 10, left: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.warning },
  fab: { position: 'absolute', bottom: 40, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  centeredMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  errorText: { color: COLORS.danger, fontSize: 16 },
  emptyText: { color: COLORS.textLight, fontSize: 16 },
});

export default ScheduleScreen;