// src/stores/hospitalStore.ts

import { create } from 'zustand';
import { Hospital } from '@/types'; // Giả sử bạn có file types.ts

// 1. Định nghĩa kiểu cho State
interface HospitalState {
  hospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  // Thêm một trạng thái để biết dữ liệu đã được fetch lần đầu chưa
  isFetched: boolean; 
}

// 2. Định nghĩa kiểu cho Actions
interface HospitalActions {
  fetchHospitals: (force?: boolean) => Promise<void>;
  reset: () => void;
}

// 3. Định nghĩa State ban đầu
const initialState: HospitalState = {
  hospitals: [],
  isLoading: false,
  error: null,
  isFetched: false,
};

// 4. Tạo store với state và actions
export const useHospitalStore = create<HospitalState & HospitalActions>((set, get) => ({
  ...initialState,

  fetchHospitals: async (force = false) => {
    // Chỉ fetch khi chưa fetch lần nào, hoặc khi có yêu cầu `force = true`
    // Điều này ngăn việc gọi API liên tục không cần thiết khi nhiều component cùng sử dụng store này
    if (get().isLoading || (get().isFetched && !force)) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Trong thực tế, bạn sẽ gọi API ở đây
      // const data = await tenantApiClient.getActiveHospitals();
      
      // Dùng dữ liệu giả để test, mô phỏng độ trễ mạng
      const data: Hospital[] = [
        { id: 'hospital-1', name: 'Bệnh viện Chợ Rẫy', code: 'CR', graphqlEndpoint: '' },
        { id: 'hospital-2', name: 'Bệnh viện Đại học Y Dược', code: 'DHYD', graphqlEndpoint: '' },
        { id: 'hospital-3', name: 'Bệnh viện Nhi Đồng 1', code: 'ND1', graphqlEndpoint: '' },
      ];

      set({ 
        hospitals: data, 
        isFetched: true,
      });
    } catch (e) {
      // Có thể log lỗi ra console hoặc hệ thống log
      console.error("Failed to fetch hospitals:", e);
      set({ error: 'Không thể tải danh sách bệnh viện.' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Action để reset store về trạng thái ban đầu nếu cần
  reset: () => {
    set(initialState);
  },
}));