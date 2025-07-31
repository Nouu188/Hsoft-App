// src/store/useAuthStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // Cần cài đặt: npm install jwt-decode

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginInput) => Promise<void>;
  register: (details: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>; // Action để load token từ bộ nhớ khi app khởi động
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await accountClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { loginInput: credentials },
      });
      const { accessToken, user } = data.login;

      await AsyncStorage.setItem('accessToken', accessToken);
      set({ accessToken, user, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e; // Ném lại lỗi để màn hình login có thể bắt và hiển thị
    }
  },

  register: async (details) => {
    // Tương tự logic login
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    set({ user: null, accessToken: null });
  },

  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        // Giải mã token để lấy thông tin user (sub, email, roles)
        const decoded: { sub: string; email: string; roles: string[] } = jwtDecode(token);
        // TODO: Có thể gọi query `me()` để lấy thông tin user đầy đủ hơn
        const user: User = { id: decoded.sub, email: decoded.email, roles: decoded.roles };
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