// src/store/useScheduleStore.ts
import { create } from 'zustand';
import dayjs from 'dayjs';
import { Dose } from '../types';
import { useAuthStore } from './useAuthStore';
import { UPDATE_DOSE_STATUS } from '@/api/mutations/doseMutations';

import isBetween from 'dayjs/plugin/isBetween';
import { schedulingClient } from '@/api/apoloClient';
import { GET_DOSES_BY_DATE_RANGE, GET_DOSES_BY_SELECTED_DATE } from '@/api/queries/doseQueries';


dayjs.extend(isBetween);

interface ScheduleState {
  selectedDate: dayjs.Dayjs;
  dosesInDateRange: Dose[]; 
  dosesForSelectedDay: Dose[]; 
  isLoading: boolean;
  error: string | null;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  fetchDosesByDateRange: (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => Promise<void>; 
  fetchDosesBySelectedDate: () => Promise<void>;
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

  fetchDosesBySelectedDate: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.warn('[ScheduleStore] Action: fetchDosesByDateRange skipped. Reason: User not authenticated.');
      set({ error: 'User not authenticated.', dosesInDateRange: [], dosesForSelectedDay: [] });
      return;
    }

    set({ isLoading: true, error: null });
    console.log(`[ScheduleStore] Action: fetchDosesBySelectedDate called. Fetching in ${get().selectedDate.format('YYYY-MM-DD')}`);

    console.log("alo", get().selectedDate.toISOString());
    try {
      const { data, loading, error } = await schedulingClient.query({
        query: GET_DOSES_BY_SELECTED_DATE,
        variables: { 
          selectedDate: get().selectedDate.toISOString()
        },
        fetchPolicy: 'network-only',
      });


      if (error) {
        // Ném lỗi để khối catch bên dưới có thể bắt được
        throw error;
      }

      const fetchedDoses: Dose[] = data.dosesBySelectedDate || [];
      console.log(`[ScheduleStore] API Success: Fetched ${fetchedDoses.length} doses.`);

      set({ 
        dosesForSelectedDay: fetchedDoses,
        isLoading: false 
      });

    } catch (e: any) {
      console.error('[ScheduleStore] API Failure: Failed to fetch doses.', e);
      set({ error: e.message, isLoading: false, dosesInDateRange: [], dosesForSelectedDay: [] });
    }
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
        query: GET_DOSES_BY_DATE_RANGE,
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
      console.log(startDate.toISOString())

      const fetchedDoses: Dose[] = data.myDoses || [];
      console.log(`[ScheduleStore] API Success: Fetched ${fetchedDoses.length} doses.`);

      set({ 
        dosesInDateRange: fetchedDoses,
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