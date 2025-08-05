import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useAuthStore } from '@/store/useAuthStore';
import DoseList from '@/components/specific/schedule/DoseList';
import DateSelector from '@/components/specific/schedule/DateSelector';

const ScheduleScreen: React.FC = () => {
  const selectedDate = useScheduleStore(state => state.selectedDate);
  const fetchDosesBySelectedDate = useScheduleStore(state => state.fetchDosesBySelectedDate);
  const isLoading = useScheduleStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);

  const onFetch = useCallback(() => {
    if (user) {
      fetchDosesBySelectedDate();
    }
  }, [user, selectedDate, fetchDosesBySelectedDate]);

  useEffect(() => {
    onFetch();
  }, [onFetch]); // Chỉ phụ thuộc vào onFetch

  // Hàm onRefresh cho RefreshControl
  const onRefresh = useCallback(() => {
    onFetch();
  }, [onFetch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        // Cung cấp các props cần thiết cho RefreshControl
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Sửa lỗi cú pháp và xử lý trường hợp user null */}
          <Text style={styles.greeting}>Chào buổi sáng, {'bạn'}!</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingTop: SIZES.padding, marginBottom: SIZES.padding / 2 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark },
  notificationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, paddingHorizontal: SIZES.padding, marginBottom: SIZES.padding },
  fab: { position: 'absolute', bottom: 40, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});

export default ScheduleScreen;