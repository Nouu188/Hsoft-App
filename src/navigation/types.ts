// src/navigation/types.ts

import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// 1. Định nghĩa các màn hình và tham số cho từng Stack

// Stack chính bao bọc các Tab
export type RootStackParamList = {
  Auth: undefined; // Màn hình đăng nhập/đăng ký
  MainTabs: NavigatorScreenParams<MainTabsParamList>; // Lồng Tab Navigator vào
  // Thêm các màn hình modal toàn cục ở đây nếu có
  Settings: undefined;
};

// Các Tab ở dưới cùng
export type MainTabsParamList = {
  Home: undefined;
  Schedule: { timeToFocus?: string }; // Màn hình lịch trình có thể nhận tham số
  MedicalRecordsStack: NavigatorScreenParams<MedicalRecordsStackParamList>; // Lồng một Stack khác vào Tab
  Notification: undefined;
  Account: undefined;
};

// Stack cho Hồ sơ Y bạ
export type MedicalRecordsStackParamList = {
  RecordsList: undefined;
  RecordDetail: { recordId: string; resultToFocus?: string };
};

// Stack cho Lịch hẹn (ví dụ)
export type AppointmentStackParamList = {
  AppointmentList: undefined;
  AppointmentDetail: { appointmentId: string };
};

// Stack cho Thanh toán (ví dụ)
export type PaymentStackParamList = {
  PaymentList: undefined;
  PaymentDetail: { paymentId: string };
};


// 2. Tạo các type helper để sử dụng trong các component

// Props cho các màn hình trong RootStack
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// Props cho các màn hình trong MainTabs
export type MainTabsScreenProps<T extends keyof MainTabsParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabsParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Type cho `useNavigation` hook khi ở trong một màn hình bất kỳ
// Giúp bạn có thể navigate đến bất kỳ đâu một cách an toàn
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Type cho `useNavigation` hook khi ở trong một màn hình của MainTabs
// Ví dụ: sử dụng trong NotificationScreen
export type MainTabsNavigationProp<T extends keyof MainTabsParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabsParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >['navigation'];