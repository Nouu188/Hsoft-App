/**
 * @file src/services/storage.ts
 * @description Service để quản lý việc lưu và đọc dữ liệu từ AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';
const APPOINTMENTS_KEY = 'appointments';
const BOOKINGS_KEY = 'bookings';

// -------------------- Onboarding --------------------
const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Lỗi khi đọc trạng thái onboarding từ storage:', error);
    return false;
  }
};

const markOnboardingAsCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Lỗi khi lưu trạng thái onboarding vào storage:', error);
  }
};

// -------------------- Appointments --------------------
const getAppointments = async (): Promise<any[]> => {
  try {
    const raw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Lỗi khi đọc appointments từ storage:', error);
    return [];
  }
};

const saveAppointments = async (appointments: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error('Lỗi khi lưu appointments vào storage:', error);
  }
};

const addAppointments = async (appointmentsToAdd: any[] = []): Promise<void> => {
  try {
    const existingRaw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const map: Record<string, any> = {};
    existing.forEach((a: any) => { if (a?.id) map[a.id] = a; });
    appointmentsToAdd.forEach((a: any) => { if (a?.id) map[a.id] = a; });
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(Object.values(map)));
  } catch (error) {
    console.error('Lỗi khi thêm appointments vào storage:', error);
  }
};

const clearAppointments = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(APPOINTMENTS_KEY);
  } catch (error) {
    console.error('Lỗi khi xóa appointments trong storage:', error);
  }
};

// -------------------- Bookings --------------------
const getBookings = async (): Promise<any[]> => {
  try {
    const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Lỗi khi đọc bookings từ storage:', error);
    return [];
  }
};

const saveBookings = async (bookings: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error('Lỗi khi lưu bookings vào storage:', error);
  }
};

const addBooking = async (booking: any): Promise<void> => {
  try {
    const existingRaw = await AsyncStorage.getItem(BOOKINGS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(booking);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Lỗi khi thêm booking vào storage:', error);
  }
};

const clearBookings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(BOOKINGS_KEY);
  } catch (error) {
    console.error('Lỗi khi xóa bookings trong storage:', error);
  }
};

export const storageService = {
  hasCompletedOnboarding,
  markOnboardingAsCompleted,
  getAppointments,
  saveAppointments,
  addAppointments,
  clearAppointments,
  getBookings,
  saveBookings,
  addBooking,
  clearBookings,
};
