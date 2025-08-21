import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { APPOINTMENT_DATA } from '@/constants/mockData';
import { COLORS,SIZES } from '@/constants/theme';
import ParallaxCarousel from './components/carousel/ParallaxCarousel';
import Ionicons from '@react-native-vector-icons/ionicons';
import {TouchableOpacity} from 'react-native';
import DoctorList from './components/doctor_list/DoctorList';

const AppointmentView = () => {
  const handleViewAll = () => {
    // TODO: Điều hướng đến màn hình danh sách tất cả lịch hẹn
    Alert.alert("Hành động", "Điều hướng đến màn hình Xem tất cả Lịch hẹn.");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch hẹn từ bác sĩ</Text>
      <ParallaxCarousel onViewAllPress={handleViewAll} data={APPOINTMENT_DATA} />
      <View style={styles.secondTitle}>
      <Text style={styles.secondTitleText}>Lịch hẹn bạn đã đặt</Text>            
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1, 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: SIZES.padding,
    marginTop: SIZES.padding,
    color:COLORS.textDark
  },
  secondTitle:{
    flexDirection:'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondTitleText: {
     fontSize: 20,
    fontWeight: 'bold',
    marginLeft: SIZES.padding,
    marginTop: SIZES.padding,
    color:COLORS.textDark
  },
  titleIcon:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: SIZES.padding,
    marginTop: SIZES.padding,
  }
});

export default AppointmentView;