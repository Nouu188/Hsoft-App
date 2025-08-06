// src/store/useScheduleStore.ts
import { create } from 'zustand';
import dayjs from 'dayjs';
import { useAuthStore } from './useAuthStore';
import { UPDATE_DOSE_STATUS } from '@/api/mutations/doseMutations';

import isBetween from 'dayjs/plugin/isBetween';
import { schedulingClient } from '@/api/apoloClient';
import { GET_DOSES_BY_DATE_RANGE, GET_DOSES_BY_SELECTED_DATE } from '@/api/queries/doseQueries';
import { Dose } from '@/types/dtos/dose/dose.dto';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';


dayjs.extend(isBetween);

interface ScheduleState {
  selectedDate: dayjs.Dayjs;
  dosesInDateRange: Dose[]; 
  dosesForSelectedDay: Dose[]; 
  groupDosesForSelectedDay: GroupedDose[];
  isLoading: boolean;
  error: string | null;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  fetchDosesByDateRange: (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => Promise<void>; 
  fetchDosesBySelectedDate: () => Promise<void>;
  updateDoseStatus: (doseId: string, status: 'TAKEN' | 'SKIPPED') => Promise<void>;
}

const groupDosesByTime = (doses: Dose[]): GroupedDose[] => {
  if (!doses || doses.length === 0) {
    return [];
  }

  const grouped = doses.reduce((item, dose) => {
    const timeKey = dose.due_at; 
    if (!item[timeKey]) {
      item[timeKey] = [];
    }
    item[timeKey].push(dose);

    return item;
  }, {} as Record<string, Dose[]>);

  const result = Object.entries(grouped).map(([time, doseArray]) => ({
    time: time,
    doses: doseArray,
  }));
  
  result.sort((a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf());

  return result;
};


export const useScheduleStore = create<ScheduleState>((set, get) => ({
  selectedDate: dayjs(),
  dosesInDateRange: [],
  dosesForSelectedDay: [],
  groupDosesForSelectedDay: [],
  isLoading: false,
  error: null,

  setSelectedDate: (date) => {
    console.log(`[ScheduleStore] Action: setSelectedDate called with`, date.format('YYYY-MM-DD'));
    set(state => {
      const dosesForNewDay = state.dosesInDateRange.filter(dose => 
        dayjs(dose.due_at).isSame(date, 'day')
      );
      console.log(`[ScheduleStore] Derived State: Found ${dosesForNewDay.length} doses for the selected day from cached range.`);

      const groupedDoses = groupDosesByTime(dosesForNewDay);
      console.log(`[ScheduleStore] Derived State: Found ${dosesForNewDay.length} doses and created ${groupedDoses.length} groups.`);
      
      return { 
        selectedDate: date,
        dosesForSelectedDay: dosesForNewDay,
        groupDosesForSelectedDay: groupedDoses,
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

      const groupedDoses = groupDosesByTime(fetchedDoses);
      console.log(`[ScheduleStore] API Success: Fetched ${fetchedDoses.length} doses and created ${groupedDoses.length} groups.`);

      set({ 
        dosesForSelectedDay: fetchedDoses,
        groupDosesForSelectedDay: groupedDoses,
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

      const currentSelectedDate = get().selectedDate;
      const dosesForCurrentDay = fetchedDoses.filter(dose => dayjs(dose.due_at).isSame(currentSelectedDate, 'day'));
      const groupedDosesForCurrentDay = groupDosesByTime(dosesForCurrentDay);

      set({ 
        dosesInDateRange: fetchedDoses,
        isLoading: false,
        groupDosesForSelectedDay: groupedDosesForCurrentDay,
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
      const updatedDosesForDay = updatedDoses.filter(dose => 
        dayjs(dose.due_at).isSame(state.selectedDate, 'day')
      );
      // Tính toán lại cả hai trạng thái
      const updatedGroupedDoses = groupDosesByTime(updatedDosesForDay);

      return {
        dosesInDateRange: updatedDoses,
        dosesForSelectedDay: updatedDosesForDay,
        groupDosesForSelectedDay: updatedGroupedDoses, // <-- Cập nhật trạng thái đã nhóm
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
        const previousDosesForDay = previousDoses.filter(dose => 
          dayjs(dose.due_at).isSame(state.selectedDate, 'day')
        );
        // Tính toán lại cả hai trạng thái khi rollback
        const previousGroupedDoses = groupDosesByTime(previousDosesForDay);
        return {
          error: `Failed to update status: ${e.message}`,
          dosesInDateRange: previousDoses,
          dosesForSelectedDay: previousDosesForDay,
          groupDosesForSelectedDay: previousGroupedDoses, // <-- Rollback trạng thái đã nhóm
        };
      });
    }
  },
}));