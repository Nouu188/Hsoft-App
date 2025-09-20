import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { TimeSlot } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';

// ---------- BookingWizard Stack ----------
export type BookingStackParamList = {
    BookingWizardMain: {
        step?: number;
        prefilledDoctors?: { doctorId: string; selectedTime: string }[];
        prefilledClinics?: { clinicId: string; selectedTime: string }[];
    };
    AppointmentBooking: {
        doctorId: string;
        doctorName: string;
        availableTimes: TimeSlot[];
        onSelectTime?: (time: string) => void; 
    };
    BookingReceipt: {
        bookingData?: any;
        appointmentCode?: string;
        fromAppointment?: boolean;
    };
    
};

// ---------- Root Stack ----------
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  AuthFlow: undefined;
  MainApp: undefined;
  OTPScreen: { email: string; hoten?: string; password?: string; type: string };
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: undefined;
  Auth: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  Settings: undefined;
  BookingWizard: NavigatorScreenParams<BookingStackParamList>; // ✅ phải lồng BookingStack
};

// ---------- Main Tabs ----------
export type MainTabsParamList = {
  Home: undefined;
  Schedule: { doseIdsToFocus?: string[] };
  MedicalRecordsStack: NavigatorScreenParams<MedicalRecordsStackParamList>;
  AppointmentStack: NavigatorScreenParams<AppointmentStackParamList>;
  PaymentStack: NavigatorScreenParams<PaymentStackParamList>;
  Notification: undefined;
  Account: undefined;
};

// ---------- Medical Records ----------
export type MedicalRecordsStackParamList = {
  RecordsList: undefined;
  RecordDetail: { recordId: string; resultToFocus?: string };
};

// ---------- Appointment ----------
export type AppointmentStackParamList = {
  AppointmentList: undefined;
  AppointmentDetail: { appointmentId: string };
};

// ---------- Payment ----------
export type PaymentStackParamList = {
  PaymentList: undefined;
  PaymentDetail: { paymentId: string };
};

// ---------- Auth ----------
export type AuthStackParamList = {
  Auth: undefined;
  MainApp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Register: undefined;
};

// ---------- Home ----------
export type HomeStackParamList = {
  Notification: undefined;
  Home: undefined;
  NotificationSetting: undefined;
  NoteScreen: undefined;
  HealthStatisticsScreen: undefined;
};

// ---------- Profile ----------
export interface Ringtone {
  id: string;
  name: string;
  duration: string;
  isCustom: boolean;
  uri: string;
}

export type ProfileStackParamList = {
  Profile: undefined;
  Languages: undefined;
  Ringtone:
    | {
        newRingtone?: {
          id: string;
          name: string;
          duration: string;
          isCustom: boolean;
          uri: string;
        };
      }
    | undefined;
  AddRingtone: { onSelect?: (newRingtone: Ringtone) => void };
  EditProfile: undefined;
};

// ---------- Helpers ----------
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabsScreenProps<T extends keyof MainTabsParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabsParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
