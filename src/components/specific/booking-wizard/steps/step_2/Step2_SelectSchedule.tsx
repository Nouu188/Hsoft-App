import React, { useEffect, useRef, useMemo } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';

import HeaderSchedule from './screen_part/time_selection/HeaderSchedule';
import SelectedFooter from './screen_part/select_footer/SelectedFooter';
import { Entity, Doctor, Clinic } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import { useBookingStore } from '@/store/useBookingStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { DOCTORS, CLINICS } from '@/constants/entity';
import EntityList from '@/components/specific/schedule/appointment/components/doctor_list/EntityList';
import { BookingStackParamList } from '@/navigation/types';
import { storageService } from '@/services/storage';

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
  const { data, addDoctor, removeDoctorTime, addClinic, removeClinicTime, getAppointments } =
    useBookingStore();
  const { selectedDate, setSelectedDate } = useScheduleStore();

  const ENTITIES: Entity[] = scheduleType === 'doctor' ? DOCTORS : CLINICS;
  const flatListRef = useRef<any>(null);
  const handleRemove = (entity: Entity, date: string) => {
  if (entity.type === 'doctor') {
    removeDoctorTime(entity.id, date);
  } else {
    removeClinicTime(entity.id, date);
  }
};
  // Sync initialDate
  useEffect(() => {
    if (initialDate) setSelectedDate(dayjs(initialDate));
  }, [initialDate, setSelectedDate]);

  // Filter entities
  const filteredEntities = useMemo(() => {
    return ENTITIES.filter(entity => {
      const isInSelectedHospital = entity.hospital === data.hospital?.name;
      const hasAvailableTimeSlot = entity.availableTimes?.some(timeSlot =>
        dayjs(timeSlot.date).isSame(selectedDate, 'day')
      );
      return isInSelectedHospital && hasAvailableTimeSlot;
    });
  }, [ENTITIES, selectedDate, data.hospital?.name]);

  // Prefill doctors
  useEffect(() => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    prefilledDoctors.forEach(({ doctorId, selectedTime }) => {
      const doctor = DOCTORS.find(d => d.id === doctorId);
      if (doctor && !data.doctorTimes[`${doctorId}-${dateStr}`]) {
        addDoctor(doctor, selectedTime, dateStr);
      }
    });
  }, [prefilledDoctors, selectedDate, addDoctor, data.doctorTimes]);

  // Scroll to entity
  useEffect(() => {
    if (scrollToEntityId && flatListRef.current && filteredEntities.length > 0) {
      const index = filteredEntities.findIndex(e => e.id === scrollToEntityId);
      if (index >= 0) flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  }, [scrollToEntityId, filteredEntities]);

  const handleSelectEntity = (entity: Entity) => {
    const availableTimes = entity.availableTimes?.filter(time =>
      dayjs(time.date).isSame(selectedDate, 'day')
    );
    if (!availableTimes || availableTimes.length === 0) {
      Alert.alert('Thông báo', 'Bác sĩ/Phòng khám không có lịch làm việc trong ngày đã chọn.');
      return;
    }
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const timeKey = `${entity.id}-${dateStr}`;

    if (entity.type === 'doctor') {
      const isSelected = !!data.doctorTimes[timeKey];
      if (isSelected) removeDoctorTime(entity.id, dateStr);
      else {
        navigation.navigate('AppointmentBooking', {
          doctorId: entity.id,
          doctorName: entity.name,
          availableTimes,
          onSelectTime: (time: string) => addDoctor(entity as Doctor, time, dateStr),
        });
      }
    } else {
      const isSelected = !!data.clinicTimes[timeKey];
      if (isSelected) removeClinicTime(entity.id, dateStr);
      else {
        navigation.navigate('AppointmentBooking', {
          doctorId: entity.id,
          doctorName: entity.name,
          availableTimes,
          onSelectTime: (time: string) => addClinic(entity as Clinic, time, dateStr),
        });
      }
    }
  };

  const handleNextStep = async () => {
    const allSelected = [
      ...data.selectedDoctors.map(d => ({
        id: d.id,
        type: 'doctor' as const,
        name: d.name,
        date: Object.keys(data.doctorTimes)
          .filter(key => key.startsWith(d.id))
          .map(key => key.split('-').slice(1).join('-'))[0], // Lấy ngày tương ứng
        time: data.doctorTimes[Object.keys(data.doctorTimes).find(key => key.startsWith(d.id))!],
      })),
      ...data.selectedClinics.map(c => ({
        id: c.id,
        type: 'clinic' as const,
        name: c.name,
        date: Object.keys(data.clinicTimes)
          .filter(key => key.startsWith(c.id))
          .map(key => key.split('-').slice(1).join('-'))[0],
        time: data.clinicTimes[Object.keys(data.clinicTimes).find(key => key.startsWith(c.id))!],
      })),
    ];

    if (allSelected.length === 0) {
      Alert.alert('Chú ý', 'Vui lòng chọn ít nhất một lịch khám.');
      return;
    }

    try {
      const bookings = await storageService.getBookings();

      const storedAppointments = bookings.flatMap(b =>
        (b.appointments || []).map((appt: any) => ({
          id: appt.id,
          type: appt.entityType,
          date: appt.date,
          time: appt.time,
          name: appt.entityName,
        }))
      );

      // Kiểm tra trùng theo type + id gốc + date + time
      const duplicates = allSelected.filter(e =>
        storedAppointments.some(s =>
          s.id === e.id &&
          s.type === e.type &&
          s.date === e.date &&
          s.time === e.time
        )
      );
      if (duplicates.length > 0) {
        // Lọc theo type đang chọn
        const doctorDuplicates = duplicates.filter(d => d.type === 'doctor');
        const clinicDuplicates = duplicates.filter(c => c.type === 'clinic');

        let message = '';
        if (scheduleType === 'doctor' && doctorDuplicates.length > 0) {
          message = doctorDuplicates
            .map(d => `Bác sĩ ${d.name} lúc ${d.time}`)
            .join('\n');
        } else if (scheduleType === 'clinic' && clinicDuplicates.length > 0) {
          message = clinicDuplicates
            .map(c => `Phòng khám ${c.name} lúc ${c.time}`)
            .join('\n');
        }

        if (message) {
          Alert.alert('Thông báo trùng lịch', message);
          return;
        }
      }

      onNext();
    } catch (err) {
      console.error('Failed to check storage', err);
      Alert.alert('Lỗi', 'Không thể kiểm tra lịch đã lưu. Vui lòng thử lại.');
    }
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
        // Truyền luôn toàn bộ dữ liệu đã chọn
        selectedDoctors={data.selectedDoctors}
        selectedClinics={data.selectedClinics}
        appointments={getAppointments()
          .map(a => ({
            key: a.key,
            entity: [...data.selectedDoctors, ...data.selectedClinics].find(e => e.id === a.entityId)!,
            date: a.key.split('-').slice(1).join('-'),
            time: a.time,
          }))
          .filter(Boolean)}
        onNext={handleNextStep}
        onRemove={handleRemove}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default Step2_SelectSchedule;
