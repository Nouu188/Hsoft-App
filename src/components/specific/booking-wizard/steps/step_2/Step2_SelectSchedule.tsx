// src/features/booking-wizard/steps/Step2_SelectSchedule.tsx
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingStackParamList } from '@/navigation/BookingWizardNavigator';
import HeaderSchedule from './screen_part/HeaderSchedule';
import SelectedFooter from './screen_part/select_footer/SelectedFooter';
import { Entity, Doctor, Clinic } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import { useBookingStore } from '@/store/useBookingStore';
import { DOCTORS, CLINICS } from '@/constants/entity';
import EntityList from '@/components/specific/schedule/appointment/components/doctor_list/EntityList';

type NavigationProp = NativeStackNavigationProp<BookingStackParamList, 'BookingWizardMain'>;

interface Step2Props {
  onNext: () => void;
  scheduleType: 'doctor' | 'clinic';
  prefilledDoctors?: { doctorId: string; selectedTime: string }[];
  prefilledClinics?: { clinicId: string; selectedTime: string }[];
  onBack?: () => void;
}

const Step2_SelectSchedule: React.FC<Step2Props> = ({
  onNext,
  scheduleType,
  prefilledDoctors = [],
  prefilledClinics = [],
}) => {
  const navigation = useNavigation<NavigationProp>();
  const {
    data: { selectedDoctors, doctorTimes, selectedClinics, clinicTimes },
    addDoctor,
    removeDoctor,
    setDoctorTime,
    addClinic,
    removeClinic,
    setClinicTime,
  } = useBookingStore();

  // Chuẩn bị danh sách entity
  const ENTITIES: Entity[] = scheduleType === 'doctor' ? DOCTORS : CLINICS;

  // Prefill doctor nếu có
  useEffect(() => {
    prefilledDoctors.forEach(({ doctorId, selectedTime }) => {
      const doctor = DOCTORS.find(d => d.id === doctorId);
      if (doctor) addDoctor(doctor, selectedTime);
    });
  }, [prefilledDoctors]);

  // Prefill clinic nếu có
  useEffect(() => {
    prefilledClinics.forEach(({ clinicId, selectedTime }) => {
      const clinic = CLINICS.find(c => c.id === clinicId);
      if (clinic) addClinic(clinic, selectedTime);
    });
  }, [prefilledClinics]);

  // Chọn entity
  const handleSelectEntity = (entity: Entity) => {
    if (entity.type === 'doctor') {
      const isSelected = selectedDoctors.some(d => d.id === entity.id);
      if (isSelected) {
        removeDoctor(entity.id);
      } else {
        // Chọn giờ
        navigation.navigate('AppointmentBooking', {
          doctorId: entity.id,
          doctorName: entity.name,
          availableTimes: entity.availableTimes,
          onSelectTime: (time: string) => {
            addDoctor(entity as Doctor, time);
            setDoctorTime(entity.id, time);
          },
        });
      }
    } else {
      // entity.type === 'clinic'
      const isSelected = selectedClinics.some(c => c.id === entity.id);
      if (isSelected) {
        removeClinic(entity.id);
      } else {
        // Chọn giờ cho phòng khám
        navigation.navigate('AppointmentBooking', {
          doctorId: entity.id, // dùng chung param
          doctorName: entity.name,
          availableTimes: entity.availableTimes,
          onSelectTime: (time: string) => {
            addClinic(entity as Clinic, time);
            setClinicTime(entity.id, time);
          },
        });
      }
    }
  };

  const handleNextStep = () => {
    const missingDoctorTime = selectedDoctors.some(d => !doctorTimes[d.id]);
    const missingClinicTime = selectedClinics.some(c => !clinicTimes[c.id]);
    if (missingDoctorTime || missingClinicTime) {
      Alert.alert('Chú ý', 'Vui lòng chọn giờ khám cho tất cả.');
      return;
    }
    onNext();
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderSchedule scheduleType={scheduleType} />
      <EntityList
        entities={ENTITIES}
        selectedEntities={scheduleType === 'doctor' ? selectedDoctors : selectedClinics}
        onSelectEntity={handleSelectEntity}
      />
      <SelectedFooter
        selectedDoctors={scheduleType === 'doctor' ? selectedDoctors : []}
        selectedClinics={scheduleType === 'clinic' ? selectedClinics : []}
        entityTimes={{ ...doctorTimes, ...clinicTimes }}
        onNext={handleNextStep}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default Step2_SelectSchedule;
