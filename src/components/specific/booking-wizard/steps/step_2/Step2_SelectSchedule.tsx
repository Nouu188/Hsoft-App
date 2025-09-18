import React, { useEffect, useRef, useMemo } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { BookingStackParamList } from '@/navigation/BookingScreenNavigator';
import HeaderSchedule from './screen_part/HeaderSchedule';
import SelectedFooter from './screen_part/select_footer/SelectedFooter';
import { Entity, Doctor, Clinic } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import { useBookingStore } from '@/store/useBookingStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { DOCTORS, CLINICS } from '@/constants/entity';
import EntityList from '@/components/specific/schedule/appointment/components/doctor_list/EntityList';

type NavigationProp = NativeStackNavigationProp<BookingStackParamList, 'BookingWizardMain'>;

interface Step2Props {
  onNext: () => void;
  onBack: (entity?: Entity) => void;
  scheduleType: 'doctor' | 'clinic';
  prefilledDoctors?: { doctorId: string; selectedTime: string }[];
  scrollToEntityId?: string;
  initialDate?: string; 
}

const Step2_SelectSchedule: React.FC<Step2Props> = ({
  onNext,
  onBack,
  scheduleType,
  prefilledDoctors = [],
  scrollToEntityId,
  initialDate,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { data, addDoctor, removeDoctorTime, setDoctorTime, addClinic, removeClinicTime, setClinicTime, getAppointments } =
    useBookingStore();
  const { selectedDate, setSelectedDate } = useScheduleStore();

  const ENTITIES: Entity[] = scheduleType === 'doctor' ? DOCTORS : CLINICS;
  const flatListRef = useRef<any>(null);

  // ✅ Sync initialDate vào store khi Step2 mount
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(dayjs(initialDate));
    }
  }, [initialDate, setSelectedDate]);

  // Lọc entity theo bệnh viện đã chọn và ngày
  const filteredEntities = useMemo(() => {
    return ENTITIES.filter(entity => {
      const isInSelectedHospital = entity.hospital === data.hospital?.name;
      const hasAvailableTimeSlot = entity.availableTimes?.some(timeSlot =>
        dayjs(timeSlot.date).isSame(selectedDate, 'day')
      );
      return isInSelectedHospital && hasAvailableTimeSlot;
    });
  }, [ENTITIES, selectedDate, data.hospital?.name]);

  // Prefill doctor - Note: This logic might need adjustment for multi-date pre-filling
  useEffect(() => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    prefilledDoctors.forEach(({ doctorId, selectedTime }) => {
      const doctor = DOCTORS.find(d => d.id === doctorId);
      if (doctor && !data.doctorTimes[`${doctorId}-${dateStr}`]) {
        addDoctor(doctor, selectedTime, dateStr);
      }
    });
  }, [prefilledDoctors, selectedDate, addDoctor, data.doctorTimes]);

  // Scroll đến entity được chỉ định
  useEffect(() => {
    if (scrollToEntityId && flatListRef.current && filteredEntities.length > 0) {
      const index = filteredEntities.findIndex(e => e.id === scrollToEntityId);
      if (index >= 0) {
        flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  }, [scrollToEntityId, filteredEntities]);

  const handleSelectEntity = (entity: Entity) => {
    const availableTimesForSelectedDate = entity.availableTimes?.filter(timeSlot =>
      dayjs(timeSlot.date).isSame(selectedDate, 'day')
    );

    if (!availableTimesForSelectedDate || availableTimesForSelectedDate.length === 0) {
      Alert.alert('Thông báo', 'Bác sĩ/Phòng khám không có lịch làm việc trong ngày đã chọn.');
      return;
    }

    const dateStr = selectedDate.format('YYYY-MM-DD');
    const timeKey = `${entity.id}-${dateStr}`;

    if (entity.type === 'doctor') {
      const isSelectedOnThisDate = !!data.doctorTimes[timeKey];
      if (isSelectedOnThisDate) {
        removeDoctorTime(entity.id, dateStr);
      } else {
        navigation.navigate('AppointmentBooking', {
          doctorId: entity.id,
          doctorName: entity.name,
          availableTimes: availableTimesForSelectedDate,
          onSelectTime: (time: string) => {
            addDoctor(entity as Doctor, time, dateStr);
          },
        });
      }
    } else {
      const isSelectedOnThisDate = !!data.clinicTimes[timeKey];
      if (isSelectedOnThisDate) {
        removeClinicTime(entity.id, dateStr);
      } else {
        navigation.navigate('AppointmentBooking', {
          doctorId: entity.id,
          doctorName: entity.name,
          availableTimes: availableTimesForSelectedDate,
          onSelectTime: (time: string) => {
            addClinic(entity as Clinic, time, dateStr);
          },
        });
      }
    }
  };

  const handleNextStep = () => {
    const hasSelection =
      (data.bookingType === 'DOCTOR' && Object.keys(data.doctorTimes).length > 0) ||
      (data.bookingType === 'CLINIC' && Object.keys(data.clinicTimes).length > 0);

    if (!hasSelection) {
      Alert.alert('Chú ý', 'Vui lòng chọn ít nhất một lịch khám.');
      return;
    }
    onNext();
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderSchedule scheduleType={scheduleType} />
      <EntityList
        ref={flatListRef}
        entities={filteredEntities}
        selectedEntities={scheduleType === 'doctor' ? data.selectedDoctors : data.selectedClinics}
        entityTimes={scheduleType === 'doctor' ? data.doctorTimes : data.clinicTimes}
        selectedDate={selectedDate.format('YYYY-MM-DD')}
        onSelectEntity={handleSelectEntity}
      />
      <SelectedFooter
        selectedDoctors={scheduleType === 'doctor' ? data.selectedDoctors : []}
        selectedClinics={scheduleType === 'clinic' ? data.selectedClinics : []}
        appointments={getAppointments().map(a => ({
          key: a.key,
          entity: [...data.selectedDoctors, ...data.selectedClinics].find(e => e.id === a.entityId)!,
          date: a.key.split('-').slice(1).join('-'),
          time: a.time,
        })).filter(Boolean)}
        onNext={handleNextStep}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default Step2_SelectSchedule;
