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
  doctorTimes: Record<string, string | undefined>; // Key: `doctorId-YYYY-MM-DD`, Value: `HH:mm - HH:mm`
  selectedClinics: Clinic[];
  clinicTimes: Record<string, string | undefined>; // Key: `clinicId-YYYY-MM-DD`, Value: `HH:mm - HH:mm`

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

  addDoctor: (doctor: Doctor, time: string, date: string) => void;
  removeDoctorTime: (doctorId: string, date: string) => void;
  setDoctorTime: (doctorId: string, time: string, date: string) => void;

  addClinic: (clinic: Clinic, time: string, date: string) => void;
  removeClinicTime: (clinicId: string, date: string) => void;
  setClinicTime: (clinicId: string, time: string, date: string) => void;

  setNotes: (notes: string) => void;
  isStepValid: (step: number) => boolean;
  resetBooking: () => void;

  // selectors/helpers
  getAppointments: () => { key: string; entityId: string; time: string | undefined }[];

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
      addDoctor: (doctor, time, date) =>
        set(state => {
          if (state.data.bookingType !== 'DOCTOR') return state;

          const isAlreadyInList = state.data.selectedDoctors.some(d => d.id === doctor.id);
          const newSelectedDoctors = isAlreadyInList
            ? state.data.selectedDoctors
            : [...state.data.selectedDoctors, doctor];

          const key = `${doctor.id}-${date}`;
          const newDoctorTimes = { ...state.data.doctorTimes, [key]: time };

          return {
            data: {
              ...state.data,
              selectedDoctors: newSelectedDoctors,
              doctorTimes: newDoctorTimes,
            },
          };
        }),

      removeDoctorTime: (doctorId, date) =>
        set(state => {
          const key = `${doctorId}-${date}`;
          const { [key]: _, ...restTimes } = state.data.doctorTimes;

          const hasOtherAppointments = Object.keys(restTimes).some(k => k.startsWith(`${doctorId}-`));

          const newSelectedDoctors = hasOtherAppointments
            ? state.data.selectedDoctors
            : state.data.selectedDoctors.filter(d => d.id !== doctorId);

          return {
            data: {
              ...state.data,
              selectedDoctors: newSelectedDoctors,
              doctorTimes: restTimes,
            },
          };
        }),

      setDoctorTime: (doctorId, time, date) =>
        set(state => {
          const key = `${doctorId}-${date}`;
          return {
            data: { ...state.data, doctorTimes: { ...state.data.doctorTimes, [key]: time } },
          };
        }),

      // multi-clinic
      addClinic: (clinic, time, date) =>
        set(state => {
          if (state.data.bookingType !== 'CLINIC') return state;
          const isAlreadyInList = state.data.selectedClinics.some(c => c.id === clinic.id);
          const newSelectedClinics = isAlreadyInList
            ? state.data.selectedClinics
            : [...state.data.selectedClinics, clinic];

          const key = `${clinic.id}-${date}`;
          const newClinicTimes = { ...state.data.clinicTimes, [key]: time };

          return {
            data: {
              ...state.data,
              selectedClinics: newSelectedClinics,
              clinicTimes: newClinicTimes,
            },
          };
        }),

      removeClinicTime: (clinicId, date) =>
        set(state => {
          const key = `${clinicId}-${date}`;
          const { [key]: _, ...restTimes } = state.data.clinicTimes;

          const hasOtherAppointments = Object.keys(restTimes).some(k => k.startsWith(`${clinicId}-`));

          const newSelectedClinics = hasOtherAppointments
            ? state.data.selectedClinics
            : state.data.selectedClinics.filter(c => c.id !== clinicId);

          return {
            data: {
              ...state.data,
              selectedClinics: newSelectedClinics,
              clinicTimes: restTimes,
            },
          };
        }),

      setClinicTime: (clinicId, time, date) =>
        set(state => {
          const key = `${clinicId}-${date}`;
          return {
            data: { ...state.data, clinicTimes: { ...state.data.clinicTimes, [key]: time } },
          };
        }),

      setNotes: notes => set(state => ({ data: { ...state.data, notes } })),

      isStepValid: step => {
        const { data } = get();
        const validators: Record<number, boolean> = {
          0: !!data.bookingType,
          1:
            (data.bookingType === 'CLINIC' &&
              data.selectedClinics.length > 0 &&
              !data.selectedClinics.some(c => !Object.keys(data.clinicTimes).some(k => k.startsWith(`${c.id}-`)))) ||
            (data.bookingType === 'DOCTOR' &&
              data.selectedDoctors.length > 0 &&
              !data.selectedDoctors.some(d => !Object.keys(data.doctorTimes).some(k => k.startsWith(`${d.id}-`)))),
          2: true,
        };
        return validators[step] ?? false;
      },

      resetBooking: () => set({ data: initialData, ui: initialUI }),

      // selectors/helpers
      getAppointments: () => {
        const state = get();
        const times = { ...state.data.doctorTimes, ...state.data.clinicTimes };
        return Object.entries(times).map(([key, value]) => {
          const [entityId] = key.split('-');
          return { key, entityId, time: value };
        });
      },

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
