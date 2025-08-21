/**
 * @file src/services/storage.ts
 * @description Service để quản lý việc lưu và đọc dữ liệu từ AsyncStorage.
 * Việc tập trung logic lưu trữ vào một nơi giúp dễ quản lý, bảo trì và tránh các "magic string".
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Khai báo một hằng số cho key lưu trữ để tránh lỗi gõ sai (typo) ở nhiều nơi trong code.
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

/**
 * Kiểm tra xem người dùng đã hoàn thành (đã xem) màn hình Onboarding hay chưa.
 * @returns {Promise<boolean>} Trả về `true` nếu người dùng đã hoàn thành, ngược lại trả về `false`.
 */
const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    // Cố gắng đọc giá trị từ AsyncStorage với key đã định nghĩa.
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    // AsyncStorage chỉ lưu chuỗi, vì vậy ta so sánh với chuỗi 'true'.
    // Nếu giá trị là 'true' thì trả về true, ngược lại (null hoặc chuỗi khác) trả về false.
    return value === 'true';
  } catch (error) {
    // Ghi lại lỗi nếu có vấn đề khi đọc dữ liệu từ storage.
    console.error('Lỗi khi đọc trạng thái onboarding từ storage:', error);
    // Mặc định trả về false để đảm bảo an toàn, tránh trường hợp người dùng bị kẹt.
    return false;
  }
};

/**
 * Đánh dấu rằng người dùng đã hoàn thành màn hình Onboarding.
 * Hàm này sẽ được gọi khi người dùng nhấn nút "Bắt đầu" hoặc "Hoàn thành" trên màn hình Onboarding.
 */
const markOnboardingAsCompleted = async (): Promise<void> => {
  try {
    // Lưu giá trị 'true' vào AsyncStorage.
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    // Ghi lại lỗi nếu có vấn đề khi lưu dữ liệu.
    console.error('Lỗi khi lưu trạng thái onboarding vào storage:', error);
  }
};

/**
 * Gom tất cả các hàm liên quan đến storage vào một object duy nhất.
 * Điều này giúp việc import và sử dụng trở nên gọn gàng hơn.
 * Ví dụ: `import { storageService } from '...'` và gọi `storageService.hasCompletedOnboarding()`.
 */
export const storageService = {
  hasCompletedOnboarding,
  markOnboardingAsCompleted,
};