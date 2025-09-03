// src/features/booking-wizard/steps/Step1_SelectHospital.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIdentityStore } from '@/store/useIdentityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { SIZES, COLORS, FONTS } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useHospitalStore } from '@/store/useHospitalsStore';
import { PatientInfoCard } from '../PatientInfoCard';
import { Hospital } from '@/types/dtos/tenant/hospital.dto';

type RootStackParamList = any;
type Step1NavigationProp = StackNavigationProp<RootStackParamList>;
interface Step1_SelectHospitalProps { onNext: () => void; }

const Step1_SelectHospital: React.FC<Step1_SelectHospitalProps> = ({ onNext }) => {
  const navigation = useNavigation<Step1NavigationProp>();
  const { identity, isLoading: isIdentityLoading, fetchIdentity } = useIdentityStore();
  const { data: bookingData, setHospital, setBookingType, isStepValid } = useBookingStore();
  const { hospitals, isLoading: areHospitalsLoading, error: hospitalsError, fetchHospitals } = useHospitalStore();

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);
  useEffect(() => { if (!identity) fetchIdentity(); }, [identity, fetchIdentity]);

  const handleNextPress = () => {
    if (isStepValid(0)) onNext();
    else Alert.alert("Thông tin chưa đầy đủ", "Vui lòng chọn bệnh viện và hình thức khám.");
  };

  const handleEditProfile = () => navigation.navigate('ProfileStack', { screen: 'EditProfile' });

  const renderHospitalSelector = () => {
    if (areHospitalsLoading) return <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />;
    if (hospitalsError) return <Text style={styles.errorText}>{hospitalsError}</Text>;
    return hospitals.map(h => (
      <TouchableOpacity
        key={h.id}
        style={[styles.optionButton, bookingData.hospital?.id === h.id && styles.optionButtonActive]}
        onPress={() => setHospital(h)}
      >
        <Text style={[styles.optionText, bookingData.hospital?.id === h.id && styles.optionTextActive]}>
          {h.name}
        </Text>
        {bookingData.hospital?.id === h.id && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
      </TouchableOpacity>
    ));
  };

  if (isIdentityLoading && !identity) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  // Data source cho FlatList
  const sections = [
    { key: 'patient', render: () => (
      <View style={styles.section}>
        <Text style={styles.title}>Thông tin bệnh nhân</Text>
        <PatientInfoCard identity={identity} onEdit={handleEditProfile} />
      </View>
    )},
    { key: 'hospital', render: () => (
      <View style={styles.section}>
        <Text style={styles.title}>Chọn bệnh viện</Text>
        {renderHospitalSelector()}
      </View>
    )},
    { key: 'bookingType', render: () => (
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
    )},
    { key: 'nextBtn', render: () => (
      <TouchableOpacity
        style={[styles.nextButton]}
        onPress={handleNextPress}
        disabled={!isStepValid(0)}
      >
        <Text style={styles.nextButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    )},
    { key: 'footer_spacer', render: () => (
      <View style={{ height: 100 }} />
    )}
  ];

  return (
    <Animated.FlatList
      data={sections}
      keyExtractor={item => item.key}
      renderItem={({ item }) => item.render()}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: SIZES.padding, backgroundColor: COLORS.background, flexGrow: 1 },
  section: { marginBottom: SIZES.padding * 1.5 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: SIZES.padding },
  optionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  optionButtonActive: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: COLORS.primaryLight },
  optionText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
  optionTextActive: { color: COLORS.primary },
  bookingTypeContainer: { flexDirection: 'row', gap: 10 },
  bookingTypeButton: { flex: 1, alignItems: 'center', backgroundColor: COLORS.white, paddingVertical: 15, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  nextButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: SIZES.radius, alignItems: 'center', marginTop: SIZES.padding },
  nextButtonDisabled: { backgroundColor: COLORS.lightGray },
  nextButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  errorText: { color: COLORS.danger, textAlign: 'center', marginVertical: 20 },
});

export default Step1_SelectHospital;
