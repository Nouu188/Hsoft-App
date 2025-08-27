import { accountClient } from '@/api/apoloClient';
import {
  EMAIL_REGISTER_MUTATION,
  LOGIN_BY_EMAIL_MUTATION,
  LOGIN_BY_IDENTIFIER_MUTATION,
  LOGIN_WITH_GOOGLE_MUTATION,
  REQUEST_EMAIL_VERIFICATION_MUTATION,
} from '@/api/mutations/authMutations';
import { fcmService } from '@/services/fcmService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { jwtDecode } from 'jwt-decode';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface JwtPayload {
  sub: string;
  identifier: string;
  roles: string[];
  iat: number;
  exp: number;
}

interface User {
  id: string;
  identifier: string;
  roles: string[];
}

interface LoginInput {
  email?: string;
  identifier?: string;
  password: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isGoogleLoading: boolean,
  error: string | null;

  login: (credentials: LoginInput) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  requestOtp: (email: string, hoten: string, password: string) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  setAuthData: (user: User, token: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

const GOOGLE_WEB_CLIENT_ID = '914111663994-qrtk1mb78ehddf545q1atqpdhikdhb16.apps.googleusercontent.com';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  isGoogleLoading: false,

  // ==========================
  // LOGIN EMAIL / IDENTIFIER
  // ==========================
  login: async (credentials: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      let data;
      if (credentials.email) {
        const res = await accountClient.mutate({
          mutation: LOGIN_BY_EMAIL_MUTATION,
          variables: { email: credentials.email, password: credentials.password },
        });
        data = res.data.loginByEmail;
      } else {
        const res = await accountClient.mutate({
          mutation: LOGIN_BY_IDENTIFIER_MUTATION,
          variables: { identifier: credentials.identifier, password: credentials.password },
        });
        data = res.data.loginByIdentifier;
      }

      const { accessToken, user } = data;

      await AsyncStorage.setItem('accessToken', accessToken);
      set({ accessToken, user, isLoading: false });

      // Đăng ký token FCM
      const fcmToken = await fcmService.getFcmToken();
      if (fcmToken) fcmService.registerTokenWithServer(fcmToken);
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  // ==========================
  // LOGIN GOOGLE
  // ==========================
  loginWithGoogle: async () => {
    set({ isGoogleLoading: true, error: null }); // Thêm state riêng
    try {
      GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) throw new Error('Google ID Token not found.');

      const { data } = await accountClient.mutate({
        mutation: LOGIN_WITH_GOOGLE_MUTATION,
        variables: { googleLoginInput: { idToken: userInfo.data?.idToken } },
      });

      if (!data?.loginWithGoogle) throw new Error('Invalid response from server.');
      const { accessToken, user } = data.loginWithGoogle;

      await AsyncStorage.setItem('accessToken', accessToken);
      set({ accessToken, user });

      const fcmToken = await fcmService.getFcmToken();
      if (fcmToken) fcmService.registerTokenWithServer(fcmToken);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (error.code === statusCodes.IN_PROGRESS) return;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Lỗi', 'Dịch vụ Google Play không khả dụng hoặc đã lỗi thời.');
      } else {
        Alert.alert('Đăng nhập thất bại', error.message || 'Đã có lỗi xảy ra.');
      }
    } finally {
      set({ isGoogleLoading: false });
    }
  },


  // ==========================
  // LOGOUT
  // ==========================
  logout: async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await accountClient.resetStore();
      set({ user: null, accessToken: null });
    } catch (e: any) {
      console.error('Logout failed:', e);
    }
  },

  // ==========================
  // OTP
  // ==========================
  requestOtp: async (email: string, hoten: string, password: string) => {
    try {
      const { data } = await accountClient.mutate({
        mutation: REQUEST_EMAIL_VERIFICATION_MUTATION,
        variables: { email, hoten, password },
      });

      if (!data?.requestEmailVerification?.success) {
        throw new Error(data?.requestEmailVerification?.message || 'Xác thực OTP thất bại.');
      }

      return data.requestEmailVerification;
    } catch (error: any) {
      console.error('[requestOtp] Error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể gửi OTP.');
      throw error;
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const { data } = await accountClient.mutate({
        mutation: EMAIL_REGISTER_MUTATION,
        variables: { email, otp },
      });

      const accessToken = data?.verifyEmailAndRegister?.accessToken;
      if (!accessToken) throw new Error('Xác thực OTP thất bại.');

      // Giải mã JWT để lấy thông tin user
      const decoded: JwtPayload = jwtDecode(accessToken);
      const user: User = {
        id: decoded.sub,
        identifier: decoded.identifier,
        roles: decoded.roles,
      };

      return { accessToken, user }; // <-- trả về object đúng
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Xác thực OTP thất bại.');
      throw error;
    }
  },

  // ==========================
  // SET AUTH DATA MANUALLY
  // ==========================
  setAuthData: async (user, token) => {
    try {
      await AsyncStorage.setItem('accessToken', token);
      set({ user, accessToken: token });
    } catch (error) {
      console.error('Failed to save auth data', error);
    }
  },

  // ==========================
  // HYDRATE ON APP START
  // ==========================
  hydrate: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return set({ isLoading: false });

      const decoded: JwtPayload = jwtDecode(token);
      const now = Date.now();
      if (decoded.exp * 1000 < now) {
        await get().logout();
      } else {
        const user: User = { id: decoded.sub, identifier: decoded.identifier, roles: decoded.roles };
        set({ user, accessToken: token, isLoading: false });

        const fcmToken = await fcmService.getFcmToken();
        if (fcmToken) fcmService.registerTokenWithServer(fcmToken);
      }
    } catch (e: any) {
      console.error('Hydration failed', e);
      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
  
}));
