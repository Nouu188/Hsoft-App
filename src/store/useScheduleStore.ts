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
  toggleDosePreparedStatus: (doseId: string) => void;
}

const TIME_SLOTS = {
  Sáng: { start: 3, end: 9 },  
  Trưa: { start: 9, end: 15 }, 
  Chiều: { start: 15, end: 18 }, 
  Tối: { start: 18, end: 23 },  
};


const groupAndProcessDoses = (doses: Dose[]): GroupedDose[] => {
  if (!doses || doses.length === 0) {
    return [];
  }

  const groupedByTime = doses.reduce((acc, dose) => {
    const timeKey = dose.due_at;
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(dose);
    return acc;
  }, {} as Record<string, Dose[]>);

  const processedGroups = Object.entries(groupedByTime).map(([time, doseArray]) => {
    const now = dayjs();
    const dueAt = dayjs(time);
    const hour = dueAt.hour();

    let timeOfDay: GroupedDose['timeOfDay'] = 'Tối';
    if (hour >= TIME_SLOTS.Sáng.start && hour <= TIME_SLOTS.Sáng.end) timeOfDay = 'Sáng';
    else if (hour >= TIME_SLOTS.Trưa.start && hour <= TIME_SLOTS.Trưa.end) timeOfDay = 'Trưa';
    else if (hour >= TIME_SLOTS.Chiều.start && hour <= TIME_SLOTS.Chiều.end) timeOfDay = 'Chiều';

    let status: GroupedDose['status'];
    const allTaken = doseArray.every(d => d.status === 'TAKEN');
    const anySkipped = doseArray.some(d => d.status === 'SKIPPED');

    if (allTaken) {
      status = 'COMPLETED';
    } else if (now.isAfter(dueAt.add(1, 'hour')) && !allTaken) {
      status = 'MISSED';
    } else if (now.isBetween(dueAt.subtract(30, 'minute'), dueAt.add(1, 'hour'))) {
      status = 'ACTIVE';
    } else {
      status = 'UPCOMING';
    }
    
    if (anySkipped) {
        status = 'MISSED';
    }

    return {
      time: time,
      doses: doseArray,
      timeOfDay: timeOfDay,
      status: status,
    };
  });

  processedGroups.sort((a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf());

  return processedGroups;
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

      const groupedDoses = groupAndProcessDoses(dosesForNewDay);
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
        throw error;
      }

      const fetchedDoses: Dose[] = data.dosesBySelectedDate || [];
      console.log(`[ScheduleStore] API Success: Fetched ${fetchedDoses.length} doses.`);

      const groupedDoses = groupAndProcessDoses(fetchedDoses);
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
        throw error;
      }
      console.log(startDate.toISOString())

      const fetchedDoses: Dose[] = data.myDoses || [];
      console.log(`[ScheduleStore] API Success: Fetched ${fetchedDoses.length} doses.`);

      const currentSelectedDate = get().selectedDate;
      const dosesForCurrentDay = fetchedDoses.filter(dose => dayjs(dose.due_at).isSame(currentSelectedDate, 'day'));
      const groupedDosesForCurrentDay = groupAndProcessDoses(dosesForCurrentDay);

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
    
    console.log('[ScheduleStore] Performing optimistic update on UI.');
    set(state => {
      const updatedDoses = state.dosesInDateRange.map(dose =>
        dose.id === doseId ? { ...dose, status } : dose
      );
      const updatedDosesForDay = updatedDoses.filter(dose => 
        dayjs(dose.due_at).isSame(state.selectedDate, 'day')
      );
      const updatedGroupedDoses = groupAndProcessDoses(updatedDosesForDay);

      return {
        dosesInDateRange: updatedDoses,
        dosesForSelectedDay: updatedDosesForDay,
        groupDosesForSelectedDay: updatedGroupedDoses,
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

        const previousGroupedDoses = groupAndProcessDoses(previousDosesForDay);
        return {
          error: `Failed to update status: ${e.message}`,
          dosesInDateRange: previousDoses,
          dosesForSelectedDay: previousDosesForDay,
          groupDosesForSelectedDay: previousGroupedDoses, 
        };
      });
    }
  },

  toggleDosePreparedStatus: (doseId) => {
    set(state => {
      const updatePreparedStatus = (doses: Dose[]) => 
        doses.map(dose => 
          dose.id === doseId ? { ...dose, is_prepared: !dose.is_prepared } : dose
        );

      const updatedDosesInDateRange = updatePreparedStatus(state.dosesInDateRange);
      const updatedDosesForDay = updatePreparedStatus(state.dosesForSelectedDay);
      
      const updatedGroupedDoses = groupAndProcessDoses(updatedDosesForDay);

      return {
        dosesInDateRange: updatedDosesInDateRange,
        dosesForSelectedDay: updatedDosesForDay,
        groupDosesForSelectedDay: updatedGroupedDoses,
      };
    });
  }
}));