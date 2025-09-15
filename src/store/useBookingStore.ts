// src/store/useBookingStore.ts
import { Clinic, Doctor } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import { Hospital } from '@/types/dtos/tenant/hospital.dto';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type BookingType = 'CLINIC' | 'DOCTOR';

interface BookingStateData {
  hospital: Hospital | null;
  bookingType: BookingType | null;
  clinic: Clinic | null;

  // multi-doctor / multi-clinic
  selectedDoctors: Doctor[];
  doctorTimes: Record<string, string | undefined>;
  selectedClinics: Clinic[];
  clinicTimes: Record<string, string | undefined>;

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

  addDoctor: (doctor: Doctor, time?: string) => void;
  removeDoctor: (doctorId: string) => void;
  setDoctorTime: (doctorId: string, time?: string) => void;

  addClinic: (clinic: Clinic, time?: string) => void;
  removeClinic: (clinicId: string) => void;
  setClinicTime: (clinicId: string, time?: string) => void;

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
  selectedClinics: [],
  clinicTimes: {},
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
        set((state) => ({
          data: {
            ...state.data,
            hospital,
            clinic: null,
            selectedDoctors: [],
            doctorTimes: {},
            selectedClinics: [],
            clinicTimes: {},
          },
        })),

      setBookingType: (type) =>
        set((state) => ({
          data: {
            ...state.data,
            bookingType: type,
            clinic: type === 'DOCTOR' ? null : state.data.clinic,
            selectedDoctors: type === 'CLINIC' ? [] : state.data.selectedDoctors,
            doctorTimes: type === 'CLINIC' ? {} : state.data.doctorTimes,
            selectedClinics: type === 'DOCTOR' ? [] : state.data.selectedClinics,
            clinicTimes: type === 'DOCTOR' ? {} : state.data.clinicTimes,
          },
        })),

      setClinic: (clinic) =>
        set((state) => ({ data: { ...state.data, clinic } })),

      // multi-doctor
      addDoctor: (doctor, time) =>
        set((state) => {
          if (state.data.bookingType !== 'DOCTOR') return state; // chỉ chọn doctor nếu bookingType = DOCTOR
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
          return { data: { ...state.data, selectedDoctors: filtered, doctorTimes: restTimes } };
        }),

      setDoctorTime: (doctorId, time) =>
        set((state) => ({
          data: { ...state.data, doctorTimes: { ...state.data.doctorTimes, [doctorId]: time } },
        })),

      // multi-clinic
      addClinic: (clinic, time) =>
        set((state) => {
          if (state.data.bookingType !== 'CLINIC') return state; // chỉ chọn clinic nếu bookingType = CLINIC
          const exists = state.data.selectedClinics.find((c) => c.id === clinic.id);
          if (exists) {
            return {
              data: {
                ...state.data,
                clinicTimes: {
                  ...state.data.clinicTimes,
                  [clinic.id]: time ?? state.data.clinicTimes[clinic.id],
                },
              },
            };
          }
          return {
            data: {
              ...state.data,
              selectedClinics: [...state.data.selectedClinics, clinic],
              clinicTimes: { ...state.data.clinicTimes, [clinic.id]: time },
            },
          };
        }),

      removeClinic: (clinicId) =>
        set((state) => {
          const filtered = state.data.selectedClinics.filter((c) => c.id !== clinicId);
          const { [clinicId]: _, ...restTimes } = state.data.clinicTimes;
          return { data: { ...state.data, selectedClinics: filtered, clinicTimes: restTimes } };
        }),

      setClinicTime: (clinicId, time) =>
        set((state) => ({
          data: { ...state.data, clinicTimes: { ...state.data.clinicTimes, [clinicId]: time } },
        })),

      setNotes: (notes) =>
        set((state) => ({ data: { ...state.data, notes } })),

      isStepValid: (step) => {
        const { data } = get();
        const validators: Record<number, boolean> = {
          0: !!data.bookingType,
          1:
            (data.bookingType === 'CLINIC' && data.selectedClinics.length > 0) ||
            (data.bookingType === 'DOCTOR' && data.selectedDoctors.length > 0),
          2: true,
        };
        return validators[step] ?? false;
      },

      resetBooking: () => set({ data: initialData, ui: initialUI }),

      // ui actions
      setSectionExpanded: (key, expanded) =>
        set((state) => ({
          ui: { ...state.ui, sectionExpanded: { ...state.ui.sectionExpanded, [key]: expanded } },
        })),

      setDropdownVisible: (visible) =>
        set((state) => ({ ui: { ...state.ui, dropdownVisible: visible } })),

      setHospitalSelected: (selected) =>
        set((state) => ({ ui: { ...state.ui, hospitalSelected: selected } })),
    }),
    { name: 'BookingStore' }
  )
);
