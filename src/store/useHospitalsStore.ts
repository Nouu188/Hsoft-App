import { create } from 'zustand';
import { Hospital } from '@/types/dtos/tenant/hospital.dto';
import { ApolloError } from '@apollo/client';
import { tenantClient } from '@/api/apoloClient';
import { GET_HOSPITALS } from '@/api/mutations/hospitalMutation';

interface HospitalState {
  hospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  isFetched: boolean;
}

interface HospitalActions {
  fetchHospitals: (force?: boolean) => Promise<void>;
  reset: () => void;
}

export const useHospitalStore = create<HospitalState & HospitalActions>((set, get) => ({
  hospitals: [],
  isLoading: false,
  error: null,
  isFetched: false,

  fetchHospitals: async (force = false) => {
    const { isLoading, isFetched } = get();
    if (isLoading || (isFetched && !force)) return;

    set({ isLoading: true, error: null });

    try {
      const { data, errors } = await tenantClient.query<{ hospitals: Hospital[] }>({
        query: GET_HOSPITALS,
        variables: { isActive: true },
        fetchPolicy: 'network-only',
      });

      if (errors?.length) {
        console.error('GraphQL errors:', errors);
        set({ error: 'Có lỗi xảy ra khi lấy danh sách bệnh viện.' });
        return;
      }

      if (!data?.hospitals) {
        set({ hospitals: [], isFetched: true });
        return;
      }

      set({
        hospitals: data.hospitals,
        isFetched: true,
      });
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
      const message = err instanceof ApolloError ? err.message : 'Không thể tải danh sách bệnh viện.';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({
    hospitals: [],
    isLoading: false,
    error: null,
    isFetched: false,
  }),
}));
