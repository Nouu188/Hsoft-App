// src/store/useBookingStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware'; // Import devtools để debug
import { Clinic, Doctor, Hospital } from '@/types'; // Import các type đã định nghĩa

// Định nghĩa kiểu cho loại hình đặt lịch
export type BookingType = 'CLINIC' | 'DOCTOR';

// Định nghĩa state cho toàn bộ luồng đặt lịch
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
  // Actions
  setHospital: (hospital: Hospital | null) => void;
  setBookingType: (type: BookingType | null) => void;
  setClinic: (clinic: Clinic | null) => void;
  setDoctor: (doctor: Doctor | null) => void;
  setAppointmentTime: (time: Date | null) => void;
  setNotes: (notes: string) => void;
  
  // Getters (hàm tiện ích)
  isStepValid: (step: number) => boolean;
  resetBooking: () => void;
}

// Giá trị ban đầu của state
const initialState: BookingStateData = {
  hospital: null,
  bookingType: null,
  clinic: null,
  doctor: null,
  appointmentTime: null,
  notes: '',
};

export const useBookingStore = create<BookingState>()(
  // Sử dụng devtools để dễ dàng debug state với Redux DevTools Extension
  devtools(
    (set, get) => ({
      data: initialState,

      // ===================================================================
      // ACTIONS - Các hàm setter tường minh
      // ===================================================================
      
      setHospital: (hospital) => {
        console.log('[BookingStore] Setting hospital:', hospital?.name);
        set(state => ({
          data: { 
            ...state.data, 
            hospital,
            // Reset các lựa chọn phụ thuộc khi đổi bệnh viện
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
            // Reset các lựa chọn không liên quan
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

      // ===================================================================
      // GETTERS - Các hàm tiện ích
      // ===================================================================

      isStepValid: (step) => {
        const data = get().data;
        switch (step) {
          case 0: // Bước 1: Chọn bệnh viện và loại hình
            return !!data.hospital && !!data.bookingType;
          case 1: // Bước 2: Chọn chi tiết và thời gian
            if (data.bookingType === 'CLINIC') {
              return !!data.clinic && !!data.appointmentTime;
            }
            if (data.bookingType === 'DOCTOR') {
              return !!data.doctor && !!data.appointmentTime;
            }
            return false;
          case 2: // Bước 3: Xác nhận
            // Bước cuối luôn hợp lệ nếu các bước trước đã qua
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
    { name: 'BookingStore' } // Tên cho Redux DevTools
  )
);