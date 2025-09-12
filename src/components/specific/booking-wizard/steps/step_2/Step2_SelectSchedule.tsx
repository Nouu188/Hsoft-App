import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingStackParamList } from '@/navigation/BookingWizardNavigator';
import DoctorList from '@/components/specific/schedule/appointment/components/doctor_list/DoctorList';
import HeaderSchedule from './screen_part/HeaderSchedule';
import SelectedFooter from './screen_part/select_footer/SelectedFooter';
import { Doctor } from '@/components/specific/schedule/appointment/components/doctor_list/DoctorCard';
import { useBookingStore } from '@/store/useBookingStore';

type NavigationProp = NativeStackNavigationProp<
  BookingStackParamList,
  'BookingWizardMain'
>;

interface Step2Props {
  onNext: () => void;
  scheduleType: 'doctor' | 'clinic';
  prefilledDoctors?: { doctorId: string; selectedTime: string }[];
  onBack?: () => void;
}

const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. John Smith',
    specialty: 'Cardiologist',
    hospital: 'City Hospital',
    gender: 'male',
    availableTimes: [
      { time: '07:30 - 08:00', isAvailable: true },
      { time: '08:00 - 08:30', isAvailable: true },
      { time: '14:00 - 14:30', isAvailable: false },
    ],
  },
  {
    id: '2',
    name: 'Dr. Jane Doe',
    specialty: 'Cardiologist',
    hospital: 'General Hospital',
    gender: 'female',
    availableTimes: [
      { time: '09:00 - 09:30', isAvailable: true },
      { time: '17:30 - 18:00', isAvailable: true },
    ],
  },
  {
    id: '3',
    name: 'Dr. Alan Walker',
    specialty: 'Dermatologist',
    hospital: 'Sunshine Clinic',
    gender: 'male',
    availableTimes: [
      { time: '08:00 - 08:30', isAvailable: true },
      { time: '10:00 - 10:30', isAvailable: true },
      { time: '15:00 - 15:30', isAvailable: false },
    ],
  },
  {
    id: '4',
    name: 'Dr. Emily Clark',
    specialty: 'Neurologist',
    hospital: 'City Hospital',
    gender: 'female',
    availableTimes: [
      { time: '09:30 - 10:00', isAvailable: true },
      { time: '13:00 - 13:30', isAvailable: true },
    ],
  },
  {
    id: '5',
    name: 'Dr. Michael Brown',
    specialty: 'Pediatrician',
    hospital: 'Green Valley Hospital',
    gender: 'male',
    availableTimes: [
      { time: '07:00 - 07:30', isAvailable: true },
      { time: '11:00 - 11:30', isAvailable: true },
    ],
  },
  {
    id: '6',
    name: 'Dr. Olivia Davis',
    specialty: 'Cardiologist',
    hospital: 'General Hospital',
    gender: 'female',
    availableTimes: [
      { time: '08:30 - 09:00', isAvailable: true },
      { time: '16:00 - 16:30', isAvailable: false },
    ],
  },
  {
    id: '7',
    name: 'Dr. William Lee',
    specialty: 'Orthopedist',
    hospital: 'Sunshine Clinic',
    gender: 'male',
    availableTimes: [
      { time: '10:00 - 10:30', isAvailable: true },
      { time: '14:30 - 15:00', isAvailable: true },
    ],
  },
  {
    id: '8',
    name: 'Dr. Sophia Taylor',
    specialty: 'Dermatologist',
    hospital: 'City Hospital',
    gender: 'female',
    availableTimes: [
      { time: '09:00 - 09:30', isAvailable: true },
      { time: '12:00 - 12:30', isAvailable: true },
    ],
  },
  {
    id: '9',
    name: 'Dr. James Wilson',
    specialty: 'Pediatrician',
    hospital: 'Green Valley Hospital',
    gender: 'male',
    availableTimes: [
      { time: '07:30 - 08:00', isAvailable: true },
      { time: '13:30 - 14:00', isAvailable: true },
    ],
  },
  {
    id: '10',
    name: 'Dr. Isabella Martinez',
    specialty: 'Neurologist',
    hospital: 'General Hospital',
    gender: 'female',
    availableTimes: [
      { time: '10:30 - 11:00', isAvailable: true },
      { time: '15:30 - 16:00', isAvailable: true },
    ],
  },
];

const Step2_SelectSchedule: React.FC<Step2Props> = ({
  onNext,
  scheduleType,
  prefilledDoctors = [],
}) => {
  const navigation = useNavigation<NavigationProp>();

  // ✅ lấy state và action từ store
  const {
    data: { selectedDoctors, doctorTimes },
    addDoctor,
    removeDoctor,
    setDoctorTime,
  } = useBookingStore();

  // Load prefilledDoctors nếu có
  useEffect(() => {
    if (prefilledDoctors.length > 0) {
      prefilledDoctors.forEach(({ doctorId, selectedTime }) => {
        const doctor = DOCTORS.find((d) => d.id === doctorId);
        if (doctor) {
          addDoctor(doctor, selectedTime); // ✅ lưu string trực tiếp
        }
      });
    }
  }, [prefilledDoctors, addDoctor]);

  // Chọn bác sĩ + mở màn hình chọn giờ
  const handleSelectDoctor = (doctor: Doctor) => {
    const isSelected = selectedDoctors.some((d) => d.id === doctor.id);

    if (isSelected) {
      // Bỏ chọn bác sĩ
      removeDoctor(doctor.id);
    } else {
      // Mở màn hình chọn giờ
      navigation.navigate('AppointmentBooking', {
        doctorId: doctor.id,
        doctorName: doctor.name,
        availableTimes: doctor.availableTimes,
        onSelectTime: (time: string) => {
          // ✅ lưu luôn vào store dưới dạng string
          addDoctor(doctor, time);
          setDoctorTime(doctor.id, time);
        },
      });
    }
  };

  const handleNextStep = () => {
    const missingTime = selectedDoctors.some((d) => !doctorTimes[d.id]);
    if (missingTime) {
      Alert.alert('Chú ý', 'Vui lòng chọn giờ khám cho tất cả bác sĩ đã chọn.');
      return;
    }
    onNext();
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderSchedule scheduleType={scheduleType} />
      <DoctorList
        doctors={DOCTORS}
        selectedDoctors={selectedDoctors}
        onSelectDoctor={handleSelectDoctor}
      />
      <SelectedFooter
        selectedDoctors={selectedDoctors}
        doctorTimes={doctorTimes}
        onNext={handleNextStep}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default Step2_SelectSchedule;
