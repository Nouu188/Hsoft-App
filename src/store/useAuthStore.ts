import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; 
import { LOGIN_MUTATION } from '@/api/mutations/authMutations';
import { accountClient } from '../api/apoloClient';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>; 
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[AuthStore] Attempting to login with credentials:', credentials);

      const { data } = await accountClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          identifier: credentials.identifier,
          password: credentials.password,
        },
      });

      console.log('[AuthStore] Login API call successful. Response data:', data);

      const { accessToken, user } = data.login;

      await AsyncStorage.setItem('accessToken', accessToken);
      set({ accessToken, user, isLoading: false });
    } catch (e: any) {
      console.error('[AuthStore] Login failed in store. Error:', e);

      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    set({ user: null, accessToken: null });
  },

  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const decoded: { sub: string; identifier: string; roles: string[] } = jwtDecode(token);
        // TODO: Có thể gọi query `me()` để lấy thông tin user đầy đủ hơn
        const user: User = { id: decoded.sub, identifier: decoded.identifier, roles: decoded.roles };
        set({ accessToken: token, user });
      }    
    } catch (e) {
      // Token không hợp lệ hoặc có lỗi, đảm bảo logout
      set({ user: null, accessToken: null });
    }
  },
}));

// Tự động hydrate khi store được tạo lần đầu
useAuthStore.getState().hydrate();