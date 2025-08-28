// src/features/booking-wizard/steps/Step1_SelectHospital.tsx (Hoàn thiện)

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIdentityStore } from '@/store/usePatientIdentityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { SIZES, COLORS, FONTS } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useHospitalStore } from '@/store/useHospitalsStore';
import { PatientInfoCard } from '../PatientInfoCard';
import { Hospital } from '@/types/dtos/tenant/hospital.dto';

// Giả sử bạn có định nghĩa RootStackParamList ở đâu đó trong file navigation
// Ví dụ: type RootStackParamList = { ProfileStack: { screen: 'EditProfile' }; BookingWizard: undefined; };
type RootStackParamList = any; // Thay thế 'any' bằng định nghĩa thật của bạn

// Định nghĩa kiểu cho props của InfoRow để sửa lỗi "any" type
type InfoRowProps = {
  label: string;
  value: string | null | undefined;
  icon: any; // Pro-tip: Điều này đảm bảo chỉ các tên icon hợp lệ mới được chấp nhận
};

// Component con để hiển thị một dòng thông tin
const InfoRow = ({ label, value, icon }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon as any} size={20} color={COLORS.textLight} style={styles.infoIcon} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
    </View>
  </View>
);

// Định nghĩa kiểu cho navigation prop
type Step1NavigationProp = StackNavigationProp<RootStackParamList>;

interface Step1_SelectHospitalProps {
  onNext: () => void;
}

const Step1_SelectHospital: React.FC<Step1_SelectHospitalProps> = ({ onNext }) => {
  // --- Định kiểu cho navigation ---
  const navigation = useNavigation<Step1NavigationProp>();
  
  // --- Lấy state từ các store ---
  const { identity, isLoading: isIdentityLoading, fetchIdentity } = useIdentityStore();
  const { data: bookingData, setHospital, setBookingType, isStepValid } = useBookingStore();
  
  // --- Lấy dữ liệu bệnh viện từ store (đã bao gồm action fetch) ---
  const { hospitals, isLoading: areHospitalsLoading, error: hospitalsError, fetchHospitals } = useHospitalStore();

  useEffect(() => {
    fetchHospitals(); 
  }, [fetchHospitals]);

  useEffect(() => {
    if (!identity) fetchIdentity();
  }, [identity, fetchIdentity]);
  
  const handleNextPress = () => {
    if (isStepValid(0)) {
      onNext();
    } else {
      Alert.alert("Thông tin chưa đầy đủ", "Vui lòng chọn bệnh viện và hình thức khám.");
    }
  };

  // Hàm điều hướng, truyền vào component con qua props
  const handleEditProfile = () => {
    navigation.navigate('ProfileStack', { screen: 'EditProfile' });
  };

  const handleSelectHospital = (hospital: Hospital) => {
    setHospital(hospital);
  };

  const renderHospitalSelector = () => {
    if (areHospitalsLoading) return <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />;
    if (hospitalsError) return <Text style={styles.errorText}>{hospitalsError}</Text>;
    
    return hospitals.map(h => (
      <TouchableOpacity 
        key={h.id} 
        style={[styles.optionButton, bookingData.hospital?.id === h.id && styles.optionButtonActive]}
        onPress={() => setHospital(h)}
      >
        <Text style={[styles.optionText, bookingData.hospital?.id === h.id && styles.optionTextActive]}>{h.name}</Text>
        {bookingData.hospital?.id === h.id && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
      </TouchableOpacity>
    ));
  };

  if (isIdentityLoading && !identity) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Phần Thông tin Bệnh nhân */}
      <View style={styles.section}>
        <Text style={styles.title}>Thông tin bệnh nhân</Text>
        <PatientInfoCard identity={identity} onEdit={handleEditProfile} />
      </View>

      {/* Phần Chọn Bệnh viện */}
      <View style={styles.section}>
        <Text style={styles.title}>Chọn bệnh viện</Text>
        {renderHospitalSelector()}
      </View>

      {/* Phần Chọn Hình thức Khám */}
      <View style={styles.section}>
        <Text style={styles.title}>Chọn hình thức khám</Text>
        <View style={styles.bookingTypeContainer}>
          <TouchableOpacity 
            style={[styles.bookingTypeButton, bookingData.bookingType === 'CLINIC' && styles.optionButtonActive]}
            onPress={() => setBookingType('CLINIC')}
          >
            <Ionicons name="business-outline" size={24} color={bookingData.bookingType === 'CLINIC' ? COLORS.primary : COLORS.textDark} />
            <Text style={[styles.optionText, bookingData.bookingType === 'CLINIC' && styles.optionTextActive]}>Theo phòng khám</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bookingTypeButton, bookingData.bookingType === 'DOCTOR' && styles.optionButtonActive]}
            onPress={() => setBookingType('DOCTOR')}
          >
            <Ionicons name="medical-outline" size={24} color={bookingData.bookingType === 'DOCTOR' ? COLORS.primary : COLORS.textDark} />
            <Text style={[styles.optionText, bookingData.bookingType === 'DOCTOR' && styles.optionTextActive]}>Theo bác sĩ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nút Tiếp tục */}
      <TouchableOpacity 
        // --- Áp dụng style 'disabled' ---
        style={[styles.nextButton, !isStepValid(0) && styles.nextButtonDisabled]} 
        onPress={handleNextPress} 
        disabled={!isStepValid(0)}
      >
        <Text style={styles.nextButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Giữ nguyên styles, chỉ thêm style cho nút disabled ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: SIZES.padding, backgroundColor: COLORS.background },
    section: { marginBottom: SIZES.padding * 1.5 },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: SIZES.padding },
    infoCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.padding },
    infoIcon: { marginRight: SIZES.padding, width: 20, textAlign: 'center', marginTop: 2 },
    infoLabel: { ...FONTS.body4, color: COLORS.textLight, marginBottom: 2 },
    infoValue: { ...FONTS.h4, color: COLORS.textDark, fontWeight: '600' },
    editButton: { alignSelf: 'flex-end', marginTop: 8, flexDirection: 'row', alignItems: 'center', padding: 5 },
    editButtonText: { color: COLORS.primary, fontWeight: 'bold', marginRight: 4 },
    optionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
    optionButtonActive: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: COLORS.primaryLight },
    optionText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
    optionTextActive: { color: COLORS.primary },
    bookingTypeContainer: { flexDirection: 'row', gap: 10 },
    bookingTypeButton: { flex: 1, alignItems: 'center', backgroundColor: COLORS.white, paddingVertical: 15, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
    nextButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: SIZES.radius, alignItems: 'center', marginTop: SIZES.padding },
    nextButtonDisabled: { backgroundColor: COLORS.lightGray }, // <-- Thêm style này
    nextButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    errorText: { color: COLORS.danger, textAlign: 'center', marginVertical: 20 },
});

export default Step1_SelectHospital;