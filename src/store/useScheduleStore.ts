// src/store/useScheduleStore.ts
import { create } from 'zustand';
import dayjs from 'dayjs';
import { Dose } from '../types';
import { useAuthStore } from './useAuthStore';
import { GET_MY_DOSES } from '@/api/queries/doseQueries';
import { UPDATE_DOSE_STATUS } from '@/api/mutations/doseMutations';

import isBetween from 'dayjs/plugin/isBetween';
import { schedulingClient } from '@/api/apoloClient';
dayjs.extend(isBetween);

interface ScheduleState {
  selectedDate: dayjs.Dayjs;
  dosesInDateRange: Dose[]; 
  dosesForSelectedDay: Dose[]; 
  isLoading: boolean;
  error: string | null;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  fetchDosesByDateRange: (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => Promise<void>; 
  updateDoseStatus: (doseId: string, status: 'TAKEN' | 'SKIPPED') => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  selectedDate: dayjs(),
  dosesInDateRange: [],
  dosesForSelectedDay: [],
  isLoading: false,
  error: null,

  setSelectedDate: (date) => {
    console.log(`[ScheduleStore] Action: setSelectedDate called with`, date.format('YYYY-MM-DD'));
    set(state => {
      const dosesForNewDay = state.dosesInDateRange.filter(dose => 
        dayjs(dose.due_at).isSame(date, 'day')
      );
      console.log(`[ScheduleStore] Derived State: Found ${dosesForNewDay.length} doses for the selected day from cached range.`);
      return { 
        selectedDate: date,
        dosesForSelectedDay: dosesForNewDay 
      };
    });
  },

  fetchDosesByDateRange: async (startDate, endDate) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.warn('[ScheduleStore] Action: fetchDosesByDateRange skipped. Reason: User not authenticated.');
      set({ error: 'User not authenticated.', dosesInDateRange: [], dosesForSelectedDay: [] });
      return;
    }

    set({ isLoading: true, error: null });
    console.log(`[ScheduleStore] Action: fetchDosesByDateRange called. Fetching from ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`);

    try {
      const { data, loading, error } = await schedulingClient.query({
        query: GET_MY_DOSES,
        variables: { 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        },
        fetchPolicy: 'network-only',
      });

      if (error) {
        // Ném lỗi để khối catch bên dưới có thể bắt được
        throw error;
      }

      const fetchedDoses: Dose[] = data.myDoses || [];
      console.log(`[ScheduleStore] API Success: Fetched ${fetchedDoses.length} doses.`);

      const currentSelectedDate = get().selectedDate;
      const dosesForCurrentDay = fetchedDoses.filter(dose => 
        dayjs(dose.due_at).isSame(currentSelectedDate, 'day')
      );
      console.log(`[ScheduleStore] Derived State: Filtering for selected date ${currentSelectedDate.format('YYYY-MM-DD')}, found ${dosesForCurrentDay.length} doses.`);

      set({ 
        dosesInDateRange: fetchedDoses,
        dosesForSelectedDay: dosesForCurrentDay,
        isLoading: false 
      });

    } catch (e: any) {
      console.error('[ScheduleStore] API Failure: Failed to fetch doses.', e);
      set({ error: e.message, isLoading: false, dosesInDateRange: [], dosesForSelectedDay: [] });
    }
  },

  updateDoseStatus: async (doseId, status) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.warn(`[ScheduleStore] Action: updateDoseStatus skipped for dose ${doseId}. Reason: User not authenticated.`);
      return;
    }

    console.log(`[ScheduleStore] Action: updateDoseStatus called for dose ${doseId} to status ${status}.`);
    const previousDoses = get().dosesInDateRange;
    
    // Optimistic Update
    console.log('[ScheduleStore] Performing optimistic update on UI.');
    set(state => {
      const updatedDoses = state.dosesInDateRange.map(dose =>
        dose.id === doseId ? { ...dose, status } : dose
      );
      return {
        dosesInDateRange: updatedDoses,
        dosesForSelectedDay: updatedDoses.filter(dose => 
          dayjs(dose.due_at).isSame(state.selectedDate, 'day')
        ),
      };
    });

    try {
      await schedulingClient.mutate({
        mutation: UPDATE_DOSE_STATUS,
        variables: { doseId, status },
      });
      console.log(`[ScheduleStore] API Success: Successfully updated dose ${doseId}.`);
    } catch (e: any) {
      console.error(`[ScheduleStore] API Failure: Failed to update dose ${doseId}. Rolling back UI.`, e);
      // Rollback
      set(state => {
        return {
          error: `Failed to update status: ${e.message}`,
          dosesInDateRange: previousDoses,
          dosesForSelectedDay: previousDoses.filter(dose => 
            dayjs(dose.due_at).isSame(state.selectedDate, 'day')
          ),
        };
      });
    }
  },
}));