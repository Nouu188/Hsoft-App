/**
 * @file App.tsx
 * @description Đây là component gốc (root component) của toàn bộ ứng dụng.
 * Nhiệm vụ chính của nó là:
 * 1. Khởi tạo `NavigationContainer` để quản lý việc điều hướng.
 * 2. Render `RootNavigator` là navigator chính chứa tất cả các màn hình và luồng của ứng dụng.
 * 3. Sử dụng custom hook `useAppInitializer` để xử lý logic khởi tạo ban đầu.
 */

import React, { useRef } from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';

import RootNavigator, { RootStackParamList } from './src/navigation/RootNavigator';
import { useAppInitializer } from './src/hooks/useAppInitializer';

const App: React.FC = () => {
  // Tạo một `ref` để có thể truy cập vào các hàm của `NavigationContainer` từ bên ngoài.
  // `ref` này sẽ được truyền vào custom hook để nó có thể thực hiện việc điều hướng.
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Gọi custom hook `useAppInitializer`.
  // Toàn bộ logic phức tạp về kiểm tra auth, timer, và điều hướng ban đầu
  // đã được đóng gói gọn gàng trong hook này.
  useAppInitializer(navigationRef);

  return (
    // `NavigationContainer` là component phải bọc ngoài cùng của mọi ứng dụng dùng React Navigation.
    <NavigationContainer ref={navigationRef}>
      {/* Cấu hình thanh trạng thái (status bar) của điện thoại. */}
      <StatusBar barStyle="dark-content" />
      
      {/* `RootNavigator` là navigator chính, chứa tất cả các màn hình của bạn. */}
      {/* Nó sẽ bắt đầu với màn hình Splash theo cấu hình trong `RootNavigator.tsx`. */}
      <RootNavigator />
    </NavigationContainer>
  );
};

export default App;