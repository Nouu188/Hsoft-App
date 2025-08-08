// src/components/specific/schedule/ScheduleHeader.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import dayjs from 'dayjs';

interface ScheduleHeaderProps {
  userName: string;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ userName }) => {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Chào buổi sáng{'\n'}
          <Text style={styles.userName}>{userName}</Text>
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={23} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={23} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>Lịch trình của bạn</Text>
        <Text style={styles.monthTitle}>Tháng {dayjs().month() + 1}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 0.4,
    marginBottom: SIZES.padding * 0.4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.white,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});

export default ScheduleHeader;