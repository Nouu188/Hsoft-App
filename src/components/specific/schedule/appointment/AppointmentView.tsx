import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { APPOINTMENT_DATA } from '@/constants/mockData';
import { SIZES } from '@/constants/theme';
import ParallaxCarousel from './components/ParallaxCarousel';

const AppointmentView = () => {
  const handleViewAll = () => {
    // TODO: Điều hướng đến màn hình danh sách tất cả lịch hẹn
    Alert.alert("Hành động", "Điều hướng đến màn hình Xem tất cả Lịch hẹn.");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch hẹn khám gần nhất của bạn</Text>
      <ParallaxCarousel onViewAllPress={handleViewAll} data={APPOINTMENT_DATA} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: SIZES.padding,
    marginTop: SIZES.padding,
  },
});

export default AppointmentView;