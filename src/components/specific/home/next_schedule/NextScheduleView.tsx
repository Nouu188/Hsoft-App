import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import { NextScheduleViewProps } from './types';

// Import các component UI con
import ScheduleItem from './components/ScheduleItem';
import NoScheduleItem from './components/NoScheduleItem';

const NextScheduleView: React.FC<NextScheduleViewProps> = ({ title, schedule, isLoading }) => {
  
  // Hàm render nội dung dựa trên state (loading, có data, không có data)
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải lịch trình...</Text>
        </View>
      );
    }

    if (schedule) {
      return (
        <ScheduleItem 
          iconName="medkit-outline"
          iconBgColor="#EAF2FD"
          title={schedule.title}
          subtitle={schedule.subtitle}
          onPress={() => Alert.alert('Chi tiết', `Xem chi tiết lịch trình: ${schedule.title}`)}
        />
      );
    }

    return <NoScheduleItem />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.base,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  loadingContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SIZES.padding,
    marginTop: 10,
    marginBottom: SIZES.padding,
  },
  loadingText: {
    color: COLORS.textLight,
    fontStyle: 'italic',
  }
});

export default NextScheduleView;