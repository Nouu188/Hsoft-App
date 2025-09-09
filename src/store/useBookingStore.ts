// src/store/useBookingStore.ts (SỬA ĐỔI - Tùy chọn 2)

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

interface BookingState {
  data: BookingStateData;
  setHospital: (hospital: Hospital | null) => void;
  setBookingType: (type: BookingType | null) => void;
  setClinic: (clinic: Clinic | null) => void;
  setDoctor: (doctor: Doctor | null) => void;
  setAppointmentTime: (time: Date | null) => void;
  setNotes: (notes: string) => void;
  // isStepValid chỉ kiểm tra các trường không liên quan đến input của HospitalInput
  isStepValid: (step: number) => boolean;
  resetBooking: () => void;
}

const initialState: BookingStateData = {
  hospital: null,
  bookingType: null,
  clinic: null,
  doctor: null,
  appointmentTime: null,
  notes: '',
};

export const useBookingStore = create<BookingState>()(
  devtools(
    (set, get) => ({
      data: initialState,

      setHospital: (hospital) => {
        console.log('[BookingStore] Setting hospital:', hospital?.name);
        set(state => ({
          data: {
            ...state.data,
            hospital,
            clinic: null,
            doctor: null,
            appointmentTime: null,
          }
        }), false, 'setHospital');
      },

      setBookingType: (type) => {
        console.log('[BookingStore] Setting booking type:', type);
        set(state => ({
          data: {
            ...state.data,
            bookingType: type,
            clinic: type === 'DOCTOR' ? null : state.data.clinic,
            doctor: type === 'CLINIC' ? null : state.data.doctor,
          }
        }), false, 'setBookingType');
      },

      setClinic: (clinic) => {
        console.log('[BookingStore] Setting clinic:', clinic?.name);
        set(state => ({ data: { ...state.data, clinic } }), false, 'setClinic');
      },

      setDoctor: (doctor) => {
        console.log('[BookingStore] Setting doctor:', doctor?.name);
        set(state => ({ data: { ...state.data, doctor } }), false, 'setDoctor');
      },

      setAppointmentTime: (time) => {
        console.log('[BookingStore] Setting appointment time:', time);
        set(state => ({ data: { ...state.data, appointmentTime: time } }), false, 'setAppointmentTime');
      },

      setNotes: (notes) => {
        set(state => ({ data: { ...state.data, notes } }), false, 'setNotes');
      },

      isStepValid: (step) => {
        const data = get().data;
        switch (step) {
          case 0: // Bước 1: Chỉ kiểm tra bookingType, vì hospital sẽ được kiểm tra ở component
            return !!data.bookingType;
          case 1: // Bước 2: Chọn chi tiết và thời gian
            if (data.bookingType === 'CLINIC') {
              return !!data.clinic && !!data.appointmentTime;
            }
            if (data.bookingType === 'DOCTOR') {
              return !!data.doctor && !!data.appointmentTime;
            }
            return false;
          case 2: // Bước 3: Xác nhận
            return true;
          default:
            return false;
        }
      },

      resetBooking: () => {
        console.log('[BookingStore] Resetting booking state.');
        set({ data: initialState }, false, 'resetBooking');
      },
    }),
    { name: 'BookingStore' }
  )
);