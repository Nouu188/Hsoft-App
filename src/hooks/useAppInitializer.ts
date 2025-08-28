/**
 * @description Custom Hook để quản lý logic khởi tạo và điều hướng ban đầu của ứng dụng.
 * Hook này chịu trách nhiệm:
 * 1. Hiển thị Splash Screen trong một khoảng thời gian tối thiểu để cải thiện trải nghiệm người dùng.
 * 2. Kiểm tra token xác thực đã được lưu hay chưa.
 * 3. Dựa vào trạng thái xác thực và onboarding, quyết định điều hướng người dùng đến màn hình phù hợp.
 */

import { useEffect, useState, RefObject } from 'react';
import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { RootStackParamList } from '../navigation/types';
import { storageService } from '../services/storage';

// Đặt thời gian chờ tối thiểu cho Splash Screen (tính bằng mili giây).
// Việc này đảm bảo splash screen không biến mất quá nhanh, tạo cảm giác mượt mà.
const MIN_SPLASH_TIME = 2000; // 2 giây

/**
 * Custom Hook để quản lý logic khởi tạo và điều hướng ban đầu của ứng dụng.
 * @param navigationRef - Một `ref` trỏ đến `NavigationContainer` để có thể điều hướng từ bên ngoài component màn hình.
 */
export const useAppInitializer = (
  navigationRef: RefObject<NavigationContainerRef<RootStackParamList> | null>
) => {
  // State để theo dõi xem thời gian chờ tối thiểu đã trôi qua chưa.
  const [isMinTimePassed, setIsMinTimePassed] = useState(false);

  // Lấy các state và action cần thiết từ Zustand store.
  // Việc chỉ lấy những state cần dùng giúp tối ưu hóa hiệu năng, tránh re-render không cần thiết.
  const isLoadingAuth = useAuthStore(state => state.isLoading);
  const accessToken = useAuthStore(state => state.accessToken);
  const hydrate = useAuthStore(state => state.hydrate);

  // --- EFFECT SỐ 1: HYDRATE AUTHENTICATION STATE ---
  // Effect này chạy một lần duy nhất khi hook được khởi tạo.
  useEffect(() => {
    // `hydrate` là một action từ `useAuthStore` để đọc token từ persistent storage (AsyncStorage).
    hydrate();
  }, [hydrate]); // `hydrate` là một hàm ổn định, nên effect này chỉ chạy 1 lần.

  // --- EFFECT SỐ 2: QUẢN LÝ TIMER CỦA SPLASH SCREEN ---
  // Effect này cũng chỉ chạy một lần duy nhất.
  useEffect(() => {
    // Bắt đầu một bộ đếm thời gian.
    const timer = setTimeout(() => {
      // Sau khi hết thời gian chờ tối thiểu, cập nhật state.
      setIsMinTimePassed(true);
    }, MIN_SPLASH_TIME);

    // Hàm dọn dẹp (cleanup function): sẽ được gọi khi component bị unmount.
    // Rất quan trọng để hủy timer, tránh rò rỉ bộ nhớ (memory leak).
    return () => clearTimeout(timer);
  }, []); // Mảng dependency rỗng `[]` đảm bảo effect chỉ chạy 1 lần khi mount.

  // --- EFFECT SỐ 3: LOGIC ĐIỀU HƯỚNG CHÍNH ---
  // Effect này sẽ chạy lại mỗi khi một trong các giá trị trong mảng dependency thay đổi.
  useEffect(() => {
    const navigateUser = async () => {
      // Logic điều hướng chỉ được thực thi khi TẤT CẢ các điều kiện sau được thỏa mãn:
      // 1. `!isLoadingAuth`: Quá trình kiểm tra token từ store đã hoàn tất.
      // 2. `isMinTimePassed`: Thời gian chờ tối thiểu của Splash Screen đã trôi qua.
      // 3. `navigationRef.current`: `NavigationContainer` đã sẵn sàng để nhận lệnh điều hướng.
      if (!isLoadingAuth && isMinTimePassed && navigationRef.current) {
        
        let routeName: keyof RootStackParamList;

        if (accessToken) {
          // TRƯỜNG HỢP 1: Người dùng đã đăng nhập (có accessToken).
          routeName = 'MainApp';
        } else {
          // TRƯỜNG HỢP 2: Người dùng chưa đăng nhập.
          // Kiểm tra xem họ đã xem onboarding chưa bằng service đã tạo.
          const onboardingCompleted = await storageService.hasCompletedOnboarding();
          routeName = onboardingCompleted ? 'AuthFlow' : 'Onboarding';
        }

        // Thực hiện điều hướng bằng `CommonActions.reset`.
        // `reset` sẽ xóa toàn bộ stack điều hướng hiện tại (tức là xóa màn hình Splash)
        // và đặt route mới làm màn hình gốc. Điều này ngăn người dùng nhấn "back" để quay lại Splash Screen.
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routeName }],
          })
        );
      }
    };

    // Gọi hàm điều hướng.
    navigateUser();
  }, [isLoadingAuth, accessToken, isMinTimePassed, navigationRef]); // Các dependency của effect.
};