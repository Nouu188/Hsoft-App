// Step2_SelectSchedule.tsx
import React, { useEffect, useRef } from 'react';
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
  onBack: (entity?: Entity) => void;
  scheduleType: 'doctor' | 'clinic';
  prefilledDoctors?: { doctorId: string; selectedTime: string }[];
  scrollToEntityId?: string;
}

const Step2_SelectSchedule: React.FC<Step2Props> = ({
  onNext,
  onBack,
  scheduleType,
  prefilledDoctors = [],
  scrollToEntityId,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { data, addDoctor, removeDoctor, setDoctorTime, addClinic, removeClinic, setClinicTime } = useBookingStore();

  const ENTITIES: Entity[] = scheduleType === 'doctor' ? DOCTORS : CLINICS;

  const flatListRef = useRef<any>(null);

  // Prefill bác sĩ nếu có
  useEffect(() => {
    prefilledDoctors.forEach(({ doctorId, selectedTime }) => {
      const doctor = DOCTORS.find(d => d.id === doctorId);
      if (doctor) addDoctor(doctor, selectedTime);
    });
  }, [prefilledDoctors]);

  // Scroll tới entity nếu có
  useEffect(() => {
    if (scrollToEntityId && flatListRef.current) {
      const index = ENTITIES.findIndex(e => e.id === scrollToEntityId);
      if (index >= 0) {
        flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  }, [scrollToEntityId]);

  const handleSelectEntity = (entity: Entity) => {
    if (entity.type === 'doctor') {
      const isSelected = data.selectedDoctors.some(d => d.id === entity.id);
      if (isSelected) removeDoctor(entity.id);
      else navigation.navigate('AppointmentBooking', {
        doctorId: entity.id,
        doctorName: entity.name,
        availableTimes: entity.availableTimes,
        onSelectTime: (time: string) => {
          addDoctor(entity as Doctor, time);
          setDoctorTime(entity.id, time);
        },
      });
    } else {
      const isSelected = data.selectedClinics.some(c => c.id === entity.id);
      if (isSelected) removeClinic(entity.id);
      else navigation.navigate('AppointmentBooking', {
        doctorId: entity.id,
        doctorName: entity.name,
        availableTimes: entity.availableTimes,
        onSelectTime: (time: string) => {
          addClinic(entity as Clinic, time);
          setClinicTime(entity.id, time);
        },
      });
    }
  };

  const handleNextStep = () => {
    const missingDoctorTime = data.selectedDoctors.some(d => !data.doctorTimes[d.id]);
    const missingClinicTime = data.selectedClinics.some(c => !data.clinicTimes[c.id]);
    if (missingDoctorTime || missingClinicTime) {
      Alert.alert('Chú ý', 'Vui lòng chọn giờ khám cho tất cả bác sĩ/phòng khám.');
      return;
    }
    onNext();
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderSchedule scheduleType={scheduleType} />
      <EntityList
        ref={flatListRef}
        entities={ENTITIES}
        selectedEntities={scheduleType === 'doctor' ? data.selectedDoctors : data.selectedClinics}
        onSelectEntity={handleSelectEntity}
      />
      <SelectedFooter
        selectedDoctors={scheduleType === 'doctor' ? data.selectedDoctors : []}
        selectedClinics={scheduleType === 'clinic' ? data.selectedClinics : []}
        entityTimes={{ ...data.doctorTimes, ...data.clinicTimes }}
        onNext={handleNextStep}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export default Step2_SelectSchedule;
