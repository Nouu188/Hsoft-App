// src/screens/schedule/ScheduleScreen.tsx (Đã tái cấu trúc theo MoMo)

import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';

// Import các component con
import SegmentedControl from '@/components/common/SegmentedControl';
import MedicationScheduleView from '@/components/specific/schedule/MedicationScheduleView';

// Placeholder cho màn hình Lịch hẹn khám
const AppointmentView = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Giao diện Lịch hẹn khám sẽ ở đây.</Text>
  </View>
);

const ScheduleScreen: React.FC = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  // Animation cho việc trượt nội dung
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(-selectedTabIndex * screenWidth, { duration: 350, easing: Easing.out(Easing.quad) }) }],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Phần Header tĩnh màu hồng */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity><Ionicons name="search-outline" size={24} color={COLORS.textDark} /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="filter-outline" size={24} color={COLORS.textDark} /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="eye-outline" size={24} color={COLORS.textDark} /></TouchableOpacity>
          </View>
        </View>

        {/* Nút chuyển đổi */}
        <SegmentedControl
          options={['Lịch uống thuốc', 'Lịch hẹn khám']}
          selectedIndex={selectedTabIndex}
          onOptionPress={setSelectedTabIndex}
        />

        {/* Phần nền trắng chứa nội dung */}
        <View style={styles.contentWrapper}>
          <Animated.View style={[styles.contentSlider, contentAnimatedStyle]}>
            <View style={{ width: screenWidth }}>
              <MedicationScheduleView />
            </View>
            <View style={{ width: screenWidth }}>
              <AppointmentView />
            </View>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary, // Màu nền hồng nhạt
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.primary, // Đảm bảo header có nền hồng
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    // Overflow hidden để nội dung trượt không bị tràn ra ngoài
    overflow: 'hidden',
  },
  contentSlider: {
    flex: 1,
    flexDirection: 'row',
    marginTop: SIZES.padding,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default ScheduleScreen;