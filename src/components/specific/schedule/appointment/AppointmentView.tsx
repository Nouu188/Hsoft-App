import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { APPOINTMENT_DATA } from '@/constants/mockData'; 
import { SIZES } from '@/constants/theme';
import ParallaxCarousel from './components/ParallaxCarousel';

const AppointmentView = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch hẹn sắp tới</Text>
      <ParallaxCarousel data={APPOINTMENT_DATA} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: SIZES.padding,
    marginBottom: SIZES.padding / 2,
  },
});

export default AppointmentView;