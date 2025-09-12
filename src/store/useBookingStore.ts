// src/store/useBookingStore.ts
import { Clinic } from '@/types/dtos/clinic/clinic.dto';
import { Doctor } from '@/components/specific/schedule/appointment/components/doctor_list/DoctorCard';
import { Hospital } from '@/types/dtos/tenant/hospital.dto';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type BookingType = 'CLINIC' | 'DOCTOR';

interface BookingStateData {
  hospital: Hospital | null;
  bookingType: BookingType | null;
  clinic: Clinic | null;

  // multi-doctor
  selectedDoctors: Doctor[];
  doctorTimes: Record<string, string | undefined>; // 🔹 sửa thành string
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

  // booking actions
  setHospital: (hospital: Hospital | null) => void;
  setBookingType: (type: BookingType | null) => void;
  setClinic: (clinic: Clinic | null) => void;

  addDoctor: (doctor: Doctor, time?: string) => void;              // 🔹 time -> string
  removeDoctor: (doctorId: string) => void;
  setDoctorTime: (doctorId: string, time?: string) => void;        // 🔹 time -> string

  setNotes: (notes: string) => void;
  isStepValid: (step: number) => boolean;
  resetBooking: () => void;

  // ui actions
  setSectionExpanded: (key: string, expanded: boolean) => void;
  setDropdownVisible: (visible: boolean) => void;
  setHospitalSelected: (selected: boolean) => void;
}

const initialData: BookingStateData = {
  hospital: null,
  bookingType: null,
  clinic: null,
  selectedDoctors: [],
  doctorTimes: {},
  notes: '',
};

const initialUI: BookingStateUI = {
  sectionExpanded: {
    hospital: true,
    bookingType: false,
    patientInfo: true,
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
              selectedDoctors: [],
              doctorTimes: {},
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
              selectedDoctors: type === 'CLINIC' ? [] : state.data.selectedDoctors,
              doctorTimes: type === 'CLINIC' ? {} : state.data.doctorTimes,
            },
          }),
          false,
          'setBookingType'
        ),

      setClinic: (clinic) =>
        set((state) => ({ data: { ...state.data, clinic } }), false, 'setClinic'),

      // multi-doctor
      addDoctor: (doctor, time) =>
        set((state) => {
          const exists = state.data.selectedDoctors.find((d) => d.id === doctor.id);
          if (exists) {
            return {
              data: {
                ...state.data,
                doctorTimes: {
                  ...state.data.doctorTimes,
                  [doctor.id]: time ?? state.data.doctorTimes[doctor.id],
                },
              },
            };
          }
          return {
            data: {
              ...state.data,
              selectedDoctors: [...state.data.selectedDoctors, doctor],
              doctorTimes: { ...state.data.doctorTimes, [doctor.id]: time },
            },
          };
        }),

      removeDoctor: (doctorId) =>
        set((state) => {
          const filtered = state.data.selectedDoctors.filter((d) => d.id !== doctorId);
          const { [doctorId]: _, ...restTimes } = state.data.doctorTimes;
          return {
            data: {
              ...state.data,
              selectedDoctors: filtered,
              doctorTimes: restTimes,
            },
          };
        }),

      setDoctorTime: (doctorId, time) =>
        set((state) => {
          const exists = state.data.selectedDoctors.find((d) => d.id === doctorId);
          return {
            data: {
              ...state.data,
              selectedDoctors: exists ? state.data.selectedDoctors : [...state.data.selectedDoctors],
              doctorTimes: { ...state.data.doctorTimes, [doctorId]: time },
            },
          };
        }),

      setNotes: (notes) =>
        set((state) => ({ data: { ...state.data, notes } }), false, 'setNotes'),

      isStepValid: (step) => {
        const { data } = get();
        const validators: Record<number, boolean> = {
          0: !!data.bookingType,
          1:
            (data.bookingType === 'CLINIC' && !!data.clinic) ||
            (data.bookingType === 'DOCTOR' && data.selectedDoctors.length > 0),
          2: true,
        };
        return validators[step] ?? false;
      },

      resetBooking: () =>
        set({ data: initialData, ui: initialUI }, false, 'resetBooking'),

      // ui actions
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
        set((state) => ({ ui: { ...state.ui, dropdownVisible: visible } }), false, 'setDropdownVisible'),

      setHospitalSelected: (selected) =>
        set((state) => ({ ui: { ...state.ui, hospitalSelected: selected } }), false, 'setHospitalSelected'),
    }),
    { name: 'BookingStore' }
  )
);
