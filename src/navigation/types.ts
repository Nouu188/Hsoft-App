import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// 1. Định nghĩa các màn hình và tham số cho từng Stack

// Stack chính bao bọc các Tab
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  AuthFlow: undefined;
  MainApp: undefined;
  OTPScreen: { email: string; hoten?: string; password?: string,type:string };
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: undefined;
  Auth: undefined; // Màn hình đăng nhập/đăng ký
  MainTabs: NavigatorScreenParams<MainTabsParamList>; // Lồng Tab Navigator vào
  // Thêm các màn hình modal toàn cục ở đây nếu có
  Settings: undefined;
};

// Các Tab ở dưới cùng
export type MainTabsParamList = {
  Home: undefined;
  Schedule: { doseIdsToFocus?: string[] }; 
  MedicalRecordsStack: NavigatorScreenParams<MedicalRecordsStackParamList>; 
  AppointmentStack: NavigatorScreenParams<AppointmentStackParamList>; 
  PaymentStack: NavigatorScreenParams<PaymentStackParamList>; 
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
//Stack cho AuthScreen
export type AuthStackParamList = {
  Auth: undefined;
  MainApp: undefined; 
  Login: undefined;
  ForgotPassword: undefined;
  Register: undefined;
};
export interface Ringtone {
  id: string;
  name: string;
  duration: string;
  isCustom: boolean;
  uri: string;
}
//Stack cho HomeScreen
export type HomeStackParamList = {
  Notification:undefined;
  Home:undefined;
  NotificationSetting:undefined;
  NoteScreen:undefined;
  HealthStatisticsScreen:undefined;
};
//Stack cho ProfileSCreen
export type ProfileStackParamList = {
  Profile: undefined;
  Languages: undefined;
  RingTone: { 
    newRingtone?: { 
      id: string; 
      name: string; 
      duration: string; 
      isCustom: boolean; 
      uri: string;
    } 
  } | undefined;
  AddRingTone: { onSelect?: (newRingtone: Ringtone) => void };
};
// Các type helper để sử dụng trong các component

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
  