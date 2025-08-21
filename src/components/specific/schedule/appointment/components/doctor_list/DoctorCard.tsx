// src/components/doctor_list/DoctorCard.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
  ImageSourcePropType,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '@/constants/theme';
// --- Types (Không đổi) ---
export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  gender: 'male' | 'female';
  availableTimes: string[];
};
export type DoctorCardProps = Omit<Doctor, 'id'>;

// --- Assets (Không đổi) ---
const maleDoctorAvatar: ImageSourcePropType =  require('../../../../../../assets/images/male-doctor.png');
const femaleDoctorAvatar: ImageSourcePropType =  require('../../../../../../assets/images/female-doctor.png');

// --- Component ---
const DoctorCard: React.FC<DoctorCardProps> = ({ name, specialty, hospital, gender, availableTimes }) => {
  const avatarSource = gender === 'male' ? maleDoctorAvatar : femaleDoctorAvatar;

  const renderTimeSlot = ({ item }: ListRenderItemInfo<string>) => (
    <TouchableOpacity style={styles.timeSlot}>
      <Text style={styles.timeText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    // 1. Thay thế View gốc bằng LinearGradient
    <LinearGradient
      colors={[COLORS.primaryLight,COLORS.primary]} // Màu gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>

      {/* 2. Thêm các vòng tròn mờ ảo VÀO BÊN TRONG, NẰM ĐẦU TIÊN để làm nền */}
      <View style={styles.blurCircle1} />
      <View style={styles.blurCircle2} />

      {/* 3. Giữ nguyên TOÀN BỘ cấu trúc thông tin cũ */}
      {/* Phần thông tin bác sĩ */}
      <View style={styles.doctorInfo}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.doctorText}>
          <Text style={styles.doctorName}>{name}</Text>
          <Text style={styles.doctorSpecialty}>{specialty}</Text>
          <Text style={styles.doctorHospital}>{hospital}</Text>
        </View>
        <TouchableOpacity style={styles.arrowContainer}>
          <Ionicons name="arrow-forward-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Phần giờ hẹn sử dụng FlatList */}
      <View style={styles.availabilityContainer}>
        <Text style={styles.availableToday}>Available Today</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={availableTimes}
          renderItem={renderTimeSlot}
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={styles.timeListContainer}
        />
      </View>
    </LinearGradient>
  );
};

// --- Styles (Cập nhật) ---
const styles = StyleSheet.create({
  // Style cho thẻ chính
  card: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // <-- Rất quan trọng: Ẩn các phần thừa của vòng tròn mờ
  },
  // Các vòng tròn mờ ảo làm nền
  blurCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(113, 155, 242, 0.15)',
    top: -50,
    left: -70,
  },
  blurCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(150, 180, 255, 0.2)',
    bottom: -80,
    right: -60,
  },
  // --- Các style cho nội dung (giữ nguyên từ code cũ) ---
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Đảm bảo nền trong suốt để thấy gradient
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  doctorText: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: 'gray',
    marginTop: 2,
  },
  doctorHospital: {
    fontSize: 14,
    color: 'gray',
    marginTop: 2,
  },
  arrowContainer: {
    padding: 5,
  },
  availabilityContainer: {
    marginTop: 15,
    backgroundColor: 'transparent', // Đảm bảo nền trong suốt
  },
  availableToday: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeSlot: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Làm màu nền của nút giờ hơi trong suốt
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 121, 107, 0.2)',
  },
  timeText: {
    color: '#00796b',
    fontWeight: '500',
  },
  timeListContainer: {
    paddingVertical: 2,
  },
});

export default DoctorCard;