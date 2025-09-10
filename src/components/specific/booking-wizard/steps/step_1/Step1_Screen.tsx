import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Animated, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useIdentityStore } from '@/store/useIdentityStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useHospitalStore } from '@/store/useHospitalsStore';
import { SIZES, COLORS, FONTS } from '@/constants/theme';
import CollapsibleSection from './collapsible_section/CollapsibleSection';
import HospitalInput from './hospital_input/HospitalInput';
import type { Hospital } from '@/types/dtos/tenant/hospital.dto';

type RootStackParamList = any;
type Step1NavigationProp = StackNavigationProp<RootStackParamList>;

interface Step1_SelectHospitalProps {
  onNext: () => void;
}

const Step1_Screen: React.FC<Step1_SelectHospitalProps> = ({ onNext }) => {
  const navigation = useNavigation<Step1NavigationProp>();
  const { identity, isLoading: isIdentityLoading, fetchIdentity } = useIdentityStore();
  const { data: bookingData, setHospital, setBookingType } = useBookingStore();
  const { hospitals, isLoading: areHospitalsLoading, error: hospitalsError, fetchHospitals } = useHospitalStore();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Zustand store cho CollapsibleSection
  const { setSectionExpanded } = useBookingStore();

  // popup state
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  // Trạng thái hợp lệ từ HospitalInput
  const [isHospitalInputValid, setIsHospitalInputValid] = useState(false);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);
  useEffect(() => { if (!identity) fetchIdentity(); }, [identity, fetchIdentity]);

  // Hàm kiểm tra tính hợp lệ của bước 1
  const isStep1Valid = () => {
    // Bệnh viện phải được chọn (bookingData.hospital không null) VÀ HospitalInput phải hợp lệ
    const isHospitalSelectedAndValid = !!bookingData.hospital && isHospitalInputValid;
    const isBookingTypeSelected = !!bookingData.bookingType;
    return isHospitalSelectedAndValid && isBookingTypeSelected;
  };

  const handleNextPress = () => {
    if (isStep1Valid()) onNext(); // Sử dụng hàm kiểm tra mới
    else Alert.alert("Thông tin chưa đầy đủ", "Vui lòng chọn bệnh viện hợp lệ và hình thức khám.");
  };

  const renderHospitalSelector = () => {
    if (areHospitalsLoading) return <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />;
    if (hospitalsError) return <Text style={styles.errorText}>{hospitalsError}</Text>;

    return (
      <HospitalInput
        hospitals={hospitals}
        value={bookingData.hospital?.externalCode}
        isLoading={areHospitalsLoading}
        onSelectHospital={(hospital) => {
          setHospital(hospital);
          setIsHospitalInputValid(true);
        }}
        onValidationChange={setIsHospitalInputValid}
      />
    );
  };

  if (isIdentityLoading && !identity) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  const sections = [
    {
      key: 'hospital', render: () => (
        <CollapsibleSection
          sectionKey="hospital"
          title="Chọn bệnh viện"
          subTitle={bookingData.hospital ? `${bookingData.hospital.name} - ${bookingData.hospital.address}` : undefined}
        >
          {renderHospitalSelector()}
        </CollapsibleSection>
      )
    },
    {
      key: 'bookingType', render: () => (
        <CollapsibleSection
          sectionKey="bookingType"
          title="Chọn hình thức khám"
          subTitle={
            bookingData.bookingType === 'CLINIC'
              ? 'Theo phòng khám'
              : bookingData.bookingType === 'DOCTOR'
                ? 'Theo bác sỹ'
                : undefined
          }
        >
          <View style={styles.bookingTypeContainer}>
            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingData.bookingType === 'CLINIC' && styles.optionButtonActive,
              ]}
              onPress={() =>
                setBookingType(
                  bookingData.bookingType === 'CLINIC' ? (undefined as any) : 'CLINIC',
                )
              }
            >
              <Ionicons
                name="business-outline"
                size={24}
                color={
                  bookingData.bookingType === 'CLINIC'
                    ? COLORS.primary
                    : COLORS.textDark
                }
              />
              <Text
                style={[
                  styles.optionText,
                  bookingData.bookingType === 'CLINIC' && styles.optionTextActive,
                ]}
              >
                Theo phòng khám
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingData.bookingType === 'DOCTOR' && styles.optionButtonActive,
              ]}
              onPress={() =>
                setBookingType(
                  bookingData.bookingType === 'DOCTOR' ? (undefined as any) : 'DOCTOR',
                )
              }
            >
              <Ionicons
                name="medical-outline"
                size={24}
                color={
                  bookingData.bookingType === 'DOCTOR'
                    ? COLORS.primary
                    : COLORS.textDark
                }
              />
              <Text
                style={[
                  styles.optionText,
                  bookingData.bookingType === 'DOCTOR' && styles.optionTextActive,
                ]}
              >
                Theo bác sỹ
              </Text>
            </TouchableOpacity>
          </View>
        </CollapsibleSection>
      )
    },

    {
      key: 'nextBtn', render: () => {
        const disabled = !isStep1Valid(); // Sử dụng hàm kiểm tra mới
        return (
          <TouchableOpacity style={[styles.nextButton, disabled && styles.nextButtonDisabled]} onPress={handleNextPress} disabled={disabled}>
            <Text style={styles.nextButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        );
      }
    },
    { key: 'footer_spacer', render: () => <View style={{ height: 100 }} /> }
  ];

  return (
    <>
      <Animated.FlatList
        data={sections}
        style={{ flex: 1 }}
        keyExtractor={item => item.key}
        renderItem={({ item }) => item.render()}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      />      
    </>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: SIZES.padding, backgroundColor: COLORS.background, flexGrow: 1 },
  optionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  optionButtonActive: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: COLORS.primaryLight },
  optionText: { ...FONTS.body3, fontWeight: '600', color: COLORS.textDark },
  optionTextActive: { color: COLORS.primary },
  bookingTypeContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  bookingTypeButton: { flex: 1, alignItems: 'center', backgroundColor: COLORS.white, paddingVertical: 15, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  nextButton: { backgroundColor: COLORS.lightBlue, padding: 15, borderRadius: SIZES.radius, alignItems: 'center', marginTop: SIZES.padding, marginHorizontal: SIZES.padding },
  nextButtonDisabled: { backgroundColor: COLORS.lightBlue, opacity: 0.5, marginHorizontal: SIZES.padding },
  nextButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  errorText: { color: COLORS.danger, textAlign: 'center', marginVertical: 20 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: COLORS.textDark },
  modalText: { fontSize: 14, marginBottom: 6, color: COLORS.textDark },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: SIZES.radius },
  modalButtonText: { color: COLORS.white, fontWeight: 'bold' },
});

export default Step1_Screen;