import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { LOGIN_MUTATION } from '../api/mutations/authMutations';
import { accountClient } from '@/api/apoloClient';
import { fcmService } from '@/services/fcmService';

interface JwtPayload {
  sub: string;
  identifier: string;
  roles: string[];
  iat: number;
  exp: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean; 
  error: string | null;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  register: () => Promise<boolean>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    console.log('[AuthStore][login] Starting login with credentials:', credentials);

    set({ isLoading: true, error: null });
    try {
      console.log('[AuthStore][login] Sending login mutation to accountClient...');
      const { data } = await accountClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          identifier: credentials.identifier,
          password: credentials.password,
        },
      });
      console.log('[AuthStore][login] Login response:', data);

      const { accessToken, user } = data.login;

      console.log('[AuthStore][login] AccessToken:', accessToken, 'User:', user);

      await AsyncStorage.setItem('accessToken', accessToken);

      console.log('[AuthStore][login] AccessToken saved to AsyncStorage');

      set({ accessToken, user, isLoading: false });

      console.log('[AuthStore][login] Login successful, state updated');

      fcmService.getFcmToken().then(token => {
        if (token) {
          fcmService.registerTokenWithServer(token);
        }
      });
    } catch (e: any) {
      console.error('[AuthStore][login] Login failed:', e.message, e);
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    console.log('[AuthStore][logout] Starting logout process...');
    try {
      await AsyncStorage.removeItem('accessToken');
      console.log('[AuthStore][logout] AccessToken removed from AsyncStorage');

      await accountClient.resetStore();
      console.log('[AuthStore][logout] Apollo Client cache reset');

      set({ user: null, accessToken: null });
      console.log('[AuthStore][logout] State reset, logout complete');
    } catch (e: any) {
      console.error('[AuthStore][logout] Logout failed:', e.message, e);
    }
  },

  register: async () => {
    console.log('[AuthStore][register] Register function called (mock implementation)');
    // Giả lập đăng ký thành công
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[AuthStore][register] Registration successful (mock)');
        resolve(true);
      }, 1000);
    });
  },

  hydrate: async () => {
    console.log('[AuthStore][hydrate] Starting hydration process...');
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('[AuthStore][hydrate] Retrieved token from AsyncStorage:', token);
      if (token) {
        const decoded: JwtPayload = jwtDecode(token);
        console.log('[AuthStore][hydrate] Decoded JWT:', decoded);
        
        // KIỂM TRA THỜI GIAN HẾT HẠN
        const currentTime = Date.now();
        const tokenExpiry = decoded.exp * 1000;
        console.log('[AuthStore][hydrate] Current time:', currentTime, 'Token expiry:', tokenExpiry);
        
        if (tokenExpiry < currentTime) {
          console.log('[AuthStore][hydrate] Token expired. Triggering logout.');
          useAuthStore.getState().logout();
        } else {
          console.log('[AuthStore][hydrate] Token is valid. Setting user state.');
          const user: User = { id: decoded.sub, identifier: decoded.identifier, roles: decoded.roles };
          
          set({ accessToken: token, user });
          console.log('[AuthStore][hydrate] User state updated:', user);

          fcmService.getFcmToken().then(fcmToken => {
            if (fcmToken) {
              fcmService.registerTokenWithServer(fcmToken);
            }
          });
        }
      } else {
        console.log('[AuthStore][hydrate] No token found in AsyncStorage.');
      }
    } catch (e: any) {
      console.error('[AuthStore][hydrate] Hydration failed:', e.message, e);
      useAuthStore.getState().logout();
    } finally {
      console.log('[AuthStore][hydrate] Hydration complete, setting isLoading to false');
      set({ isLoading: false });
    }
  },
}));