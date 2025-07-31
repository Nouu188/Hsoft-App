// src/store/useScheduleStore.ts
import { create } from 'zustand';
import dayjs from 'dayjs';
import { Dose } from '../types';
import { GET_MY_DOSES } from '../graphql/queries';
import { useAuthStore } from './useAuthStore'; // <-- Import auth store
import { schedulingClient } from '@/services/apoloClient';
import { UPDATE_DOSE_STATUS } from '@/graphql/mutations';

interface ScheduleState {
  selectedDate: dayjs.Dayjs;
  dosesForDay: Dose[];
  isLoading: boolean;
  error: string | null;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  fetchDosesInWeek: () => Promise<void>; // <-- Không cần userId
  updateDoseStatus: (doseId: string, status: 'TAKEN' | 'SKIPPED') => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  selectedDate: dayjs(),
  dosesForDay: [],
  isLoading: false,
  error: null,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    // Tự động fetch lại doses khi đổi ngày
    get().fetchDosesInWeek();
  },

  fetchDosesInWeek: async () => {
    // Lấy user từ AuthStore
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'User not authenticated.', dosesForDay: [] });
      return;
    }

    const date = get().selectedDate;
    set({ isLoading: true, error: null });

    try {
      const startDate = date.startOf('day').toISOString();
      const endDate = date.endOf('day').toISOString();

      const { data } = await schedulingClient.query({
        query: GET_MY_DOSES,
        // Không cần truyền userId nữa, backend sẽ tự lấy từ token
        variables: { startDate, endDate },
        fetchPolicy: 'network-only',
      });
      
      set({ dosesForDay: data.myDoses || [], isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  updateDoseStatus: async (doseId, status) => {
    const user = useAuthStore.getState().user;
    if (!user) return; // Không cho phép cập nhật nếu chưa đăng nhập

    const previousDoses = get().dosesForDay;
    
    set(state => ({
      dosesForDay: state.dosesForDay.map(dose =>
        dose.id === doseId ? { ...dose, status } : dose
      ),
    }));

    try {
      await schedulingClient.mutate({
        mutation: UPDATE_DOSE_STATUS,
        variables: { doseId, status },
      });
    } catch (e: any) {
      set({ error: `Failed to update status: ${e.message}`, dosesForDay: previousDoses });
    }
  },
}));