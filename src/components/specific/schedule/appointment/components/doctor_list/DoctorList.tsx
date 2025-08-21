// src/components/specific/schedule/appointment/components/doctor_list/DoctorList.tsx

import React from 'react';
// 1. Import thêm các kiểu và component cần thiết
import { FlatList, StyleSheet, ListRenderItemInfo, FlatListProps } from 'react-native';
import Animated from 'react-native-reanimated'; // Cần cho animation
import { COLORS, SIZES } from '@/constants/theme';
import DoctorCard, { Doctor } from './DoctorCard';

// Dữ liệu mẫu (giữ nguyên)
const DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. John Smith', specialty: 'Cardiologist', hospital: 'City Hospital', gender: 'male', availableTimes: ['10:15 am', '11:00 am', '11:45 am', '2:00 pm', '2:45 pm'] },
  { id: '2', name: 'Dr. Jane Doe', specialty: 'Cardiologist', hospital: 'General Hospital', gender: 'female', availableTimes: ['9:00 am', '9:45 am', '10:30 am', '1:00 pm', '1:45 pm'] },
  { id: '3', name: 'Dr. Emily White', specialty: 'Dermatologist', hospital: 'Medical Center', gender: 'female', availableTimes: ['11:15 am', '12:00 pm', '2:30 pm', '3:15 pm', '4:00 pm'] },
  { id: '4', name: 'Dr. Emily qwer', specialty: 'Dermatologist', hospital: 'Medal Center', gender: 'female', availableTimes: ['11:15 am', '12:00 pm', '2:30 pm', '3:15 pm', '4:00 pm'] },
  { id: '5', name: 'Dr. dasd White', specialty: 'matologist', hospital: 'dical Center', gender: 'male', availableTimes: ['11:15 am', '12:00 pm', '2:30 pm', '3:15 pm', '4:00 pm'] },
  { id: '6', name: 'Dr. Ben White', specialty: 'Dermatologist', hospital: 'Medical Centre', gender: 'male', availableTimes: ['11:15 am', '12:00 pm', '2:30 pm', '3:15 pm', '4:00 pm'] },
];

// 2. Tạo một AnimatedFlatList để tương thích với Reanimated
const AnimatedFlatList = Animated.createAnimatedComponent<FlatList<Doctor>>(FlatList);

// 3. Định nghĩa props mới cho DoctorList
// Nó sẽ nhận tất cả props của một FlatList thông thường,
// ngoại trừ 'data' và 'renderItem' vì component này tự quản lý chúng.
interface DoctorListProps extends Omit<FlatListProps<Doctor>, 'data' | 'renderItem'> {}

// --- Component ---
// 4. Cập nhật component để nhận và sử dụng props mới
const DoctorList: React.FC<DoctorListProps> = (props) => {
  // Hàm render cho danh sách bác sĩ (không đổi)
  const renderItem = ({ item }: ListRenderItemInfo<Doctor>) => (
    <DoctorCard
      name={item.name}
      specialty={item.specialty}
      hospital={item.hospital}
      gender={item.gender}
      availableTimes={item.availableTimes}
    />
  );

  // 5. Tách các props từ bên ngoài, đặc biệt là contentContainerStyle
  const { contentContainerStyle, ...rest } = props;

  return (
    // 6. Loại bỏ SafeAreaView và sử dụng AnimatedFlatList
    // Truyền vào tất cả các props từ cha (...rest)
    <AnimatedFlatList
      data={DOCTORS}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      // Hợp nhất style từ cha và style mặc định của component
      contentContainerStyle={[styles.listContentContainer, contentContainerStyle]}
      {...rest} // Áp dụng các props còn lại như onScroll, scrollEventThrottle,...
    />
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  // Bỏ style container vì component cha sẽ quản lý layout
  listContentContainer: {
    padding: SIZES.base * 1.25,
    backgroundColor: COLORS.white,
  },
});

export default DoctorList;