import { accountClient } from '@/api/apoloClient';
import {
  EMAIL_REGISTER_MUTATION,
  LOGIN_BY_EMAIL_MUTATION,
  LOGIN_BY_PHONE_NUMBER_MUTATION,
  LOGIN_WITH_GOOGLE_MUTATION,
  REQUEST_EMAIL_VERIFICATION_MUTATION,
} from '@/api/mutations/authMutations';
import { fcmService } from '@/services/fcmService';
import { JwtPayload } from '@/types/dtos/auth/jwt.payload';
import { LoginInput } from '@/types/dtos/auth/login.input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { jwtDecode } from 'jwt-decode';
import { Alert } from 'react-native';
import { create } from 'zustand';

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

  login: async (credentials: LoginInput) => {
    set({ isLoading: true, error: null });
    const logPrefix = '[AuthStore][login]';

    try {
      let data;
      if (credentials.email) {
        console.log(`${logPrefix} Logging in with email: ${credentials.email}`);
        console.log(`${logPrefix} Payload (without password):`, {
          email: credentials.email,
        });

        const res = await accountClient.mutate({
          mutation: LOGIN_BY_EMAIL_MUTATION,
          variables: { email: credentials.email, password: credentials.password },
        });

        console.log(`${logPrefix} GraphQL response:`, res.data);
        data = res.data.loginByEmail;
      } else {
        console.log(`${logPrefix} Logging in with phone: ${credentials.phoneNumber}`);
        console.log(`${logPrefix} External hospital code:`, credentials.externalHospitalCode);

        if (!credentials.externalHospitalCode) {
          throw new Error('External hospital code is required when logging in with phone number.');
        }

        const res = await accountClient.mutate({
          mutation: LOGIN_BY_PHONE_NUMBER_MUTATION,
          variables: {
            phoneNumber: credentials.phoneNumber,
            password: credentials.password,
            externalHospitalCode: credentials.externalHospitalCode,
          },
        });

        console.log(`${logPrefix} GraphQL response:`, res.data);
        data = res.data.loginByPhoneNumber;
      }

      if (!data) {
        throw new Error('No data returned from GraphQL mutation.');
      }

      const { accessToken, user } = data;

      await AsyncStorage.setItem('accessToken', accessToken);
      set({ accessToken, user, isLoading: false });

      console.log(`${logPrefix} Login successful. UserId: ${user.id}`);

      // Đăng ký token FCM
      const fcmToken = await fcmService.getFcmToken();
      if (fcmToken) {
        console.log(`${logPrefix} Registering FCM token with server.`);
        fcmService.registerTokenWithServer(fcmToken);
      }

    } catch (e: any) {
      console.error(`${logPrefix} Login failed:`, e.message, e.stack);
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  loginWithGoogle: async () => {
    set({ isGoogleLoading: true, error: null });
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

  logout: async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await accountClient.resetStore();
      set({ user: null, accessToken: null });
    } catch (e: any) {
      console.error('Logout failed:', e);
    }
  },

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

      const decoded: JwtPayload = jwtDecode(accessToken);
      const user: User = {
        id: decoded.sub,
        identifier: decoded.identifier,
        roles: decoded.roles,
      };

      return { accessToken, user };
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Xác thực OTP thất bại.');
      throw error;
    }
  },

  setAuthData: async (user, token) => {
    try {
      await AsyncStorage.setItem('accessToken', token);
      set({ user, accessToken: token });
    } catch (error) {
      console.error('Failed to save auth data', error);
    }
  },

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
