// src/store/useBookingStore.ts
import { Clinic } from '@/types/dtos/clinic/clinic.dto';
import { Doctor } from '@/types/dtos/doctor/doctor.dto';
import { Hospital } from '@/types/dtos/tenant/hospital.dto';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type BookingType = 'CLINIC' | 'DOCTOR';

interface BookingStateData {
  hospital: Hospital | null;
  bookingType: BookingType | null;
  clinic: Clinic | null;
  doctor: Doctor | null;
  appointmentTime: Date | null;
  notes: string;
}

interface BookingStateUI {
  sectionExpanded: { [key: string]: boolean };
  dropdownVisible: boolean;
  hospitalSelected: boolean;
}

interface BookingState {
  data: BookingStateData;
  ui: BookingStateUI;

  // actions booking
  setHospital: (hospital: Hospital | null) => void;
  setBookingType: (type: BookingType | null) => void;
  setClinic: (clinic: Clinic | null) => void;
  setDoctor: (doctor: Doctor | null) => void;
  setAppointmentTime: (time: Date | null) => void;
  setNotes: (notes: string) => void;
  isStepValid: (step: number) => boolean;
  resetBooking: () => void;

  // actions UI
  setSectionExpanded: (key: string, expanded: boolean) => void;
  setDropdownVisible: (visible: boolean) => void;
  setHospitalSelected: (selected: boolean) => void;
}

const initialData: BookingStateData = {
  hospital: null,
  bookingType: null,
  clinic: null,
  doctor: null,
  appointmentTime: null,
  notes: '',
};

const initialUI: BookingStateUI = {
  sectionExpanded: {
    hospital: true,
    bookingType: false,
    patientInfo: true, // 👈 thêm cho Step 3, mở mặc định
  },
  dropdownVisible: false,
  hospitalSelected: false,
};

export const useBookingStore = create<BookingState>()(
  devtools(
    (set, get) => ({
      data: initialData,
      ui: initialUI,

      // booking actions
      setHospital: (hospital) =>
        set(
          (state) => ({
            data: {
              ...state.data,
              hospital,
              clinic: null,
              doctor: null,
              appointmentTime: null,
            },
          }),
          false,
          'setHospital'
        ),

      setBookingType: (type) =>
        set(
          (state) => ({
            data: {
              ...state.data,
              bookingType: type,
              clinic: type === 'DOCTOR' ? null : state.data.clinic,
              doctor: type === 'CLINIC' ? null : state.data.doctor,
            },
          }),
          false,
          'setBookingType'
        ),

      setClinic: (clinic) =>
        set((state) => ({ data: { ...state.data, clinic } }), false, 'setClinic'),

      setDoctor: (doctor) =>
        set((state) => ({ data: { ...state.data, doctor } }), false, 'setDoctor'),

      setAppointmentTime: (time) =>
        set(
          (state) => ({ data: { ...state.data, appointmentTime: time } }),
          false,
          'setAppointmentTime'
        ),

      setNotes: (notes) =>
        set((state) => ({ data: { ...state.data, notes } }), false, 'setNotes'),

      isStepValid: (step) => {
        const { data } = get();
        const validators: Record<number, boolean> = {
          0: !!data.bookingType,
          1:
            (data.bookingType === 'CLINIC' && !!data.clinic && !!data.appointmentTime) ||
            (data.bookingType === 'DOCTOR' && !!data.doctor && !!data.appointmentTime),
          2: true,
        };
        return validators[step] ?? false;
      },

      resetBooking: () =>
        set(
          { data: initialData, ui: initialUI },
          false,
          'resetBooking'
        ),

      // UI actions
      setSectionExpanded: (key, expanded) =>
        set(
          (state) => ({
            ui: {
              ...state.ui,
              sectionExpanded: { ...state.ui.sectionExpanded, [key]: expanded },
            },
          }),
          false,
          'setSectionExpanded'
        ),

      setDropdownVisible: (visible) =>
        set(
          (state) => ({ ui: { ...state.ui, dropdownVisible: visible } }),
          false,
          'setDropdownVisible'
        ),

      setHospitalSelected: (selected) =>
        set(
          (state) => ({ ui: { ...state.ui, hospitalSelected: selected } }),
          false,
          'setHospitalSelected'
        ),
    }),
    { name: 'BookingStore' }
  )
);
