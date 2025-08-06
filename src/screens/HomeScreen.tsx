// src/screens/HomeScreen.tsx (Đã cấu trúc lại)

import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useAuthStore } from '@/store/useAuthStore';
import DoseList from '@/components/specific/schedule/DoseList';
import DateSelector from '@/components/specific/schedule/DateSelector';
import dayjs from 'dayjs';

const HomeScreen: React.FC = () => {
  const selectedDate = useScheduleStore(state => state.selectedDate);
  const fetchDosesBySelectedDate = useScheduleStore(state => state.fetchDosesBySelectedDate);
  const isLoading = useScheduleStore(state => state.isLoading);
  const error = useScheduleStore(state => state.error);
  const user = useAuthStore(state => state.user);

  const onFetch = useCallback(() => {
    if (user) {
      fetchDosesBySelectedDate();
    }
  }, [user, fetchDosesBySelectedDate, selectedDate]); // Bỏ selectedDate vì fetchDosesBySelectedDate đã lấy từ store

  useEffect(() => {
    onFetch();
  }, [onFetch]);

  const onRefresh = useCallback(() => {
    onFetch();
  }, [onFetch]);

  // 1. Định nghĩa các phần của màn hình dưới dạng một mảng dữ liệu
  const screenSections = [
    { type: 'header', id: 'header' },
    { type: 'date_selector', id: 'date_selector' },
    { type: 'dose_list', id: 'dose_list' },
    // Thêm một item giả ở cuối để FAB không che mất nội dung
    { type: 'footer_spacer', id: 'footer_spacer' }, 
  ];

  // 2. Tạo một hàm để render từng phần
  const renderSection = ({ item }: { item: { type: string } }) => {
    switch (item.type) {
      case 'header':
        return (
          <>
            <View style={styles.header}>
              <Text style={styles.greeting}>Chào buổi sáng{'\n'}<Text style={styles.userName}>Thịnh</Text></Text>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Lịch trình của bạn</Text>
              <Text style={styles.monthTitle}>Tháng {dayjs().month() + 1}</Text>
            </View>
          </>
        );
      case 'date_selector':
        return <DateSelector />;
      case 'dose_list':
        // DoseList bây giờ là một item bình thường, không lồng nhau
        return <DoseList />;
      case 'footer_spacer':
        // Khoảng trống ở cuối để nút FAB không che nội dung
        return <View style={{ height: 100 }} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 3. Sử dụng MỘT FlatList duy nhất */}
      <FlatList
        data={screenSections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Nút thêm mới (FAB) */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, // Đổi màu nền cho nhất quán
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.padding, 
    paddingTop: SIZES.padding, 
    marginBottom: SIZES.padding,
  },
  greeting: { 
    fontSize: 24, 
    fontWeight: '300', 
    color: COLORS.textLight 
  },
  userName: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
  notificationButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.white, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.textDark, 
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  fab: { 
    position: 'absolute', 
    bottom: 40, 
    right: 20, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8 
  },
});

export default HomeScreen;