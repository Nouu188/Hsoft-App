import { create } from 'zustand';
import dayjs from 'dayjs';
import { useAuthStore } from './useAuthStore';
import { UPDATE_DOSE_STATUS, UPDATE_DOSES_MUTATION } from '@/api/mutations/doseMutations';

import isBetween from 'dayjs/plugin/isBetween';
import { schedulingClient } from '@/api/apoloClient';
import { GET_DOSES_BY_DATE_RANGE, GET_DOSES_BY_SELECTED_DATE } from '@/api/queries/doseQueries';
import { Dose } from '@/types/dtos/dose/dose.dto';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';
import { DoseStatus, GroupedDoseStatus, MealRelation } from '@/types';

dayjs.extend(isBetween);

interface SkipReason {
  category: string;
  detail?: string;
}
interface ScheduleState {
  doses: any;
  selectedDate: dayjs.Dayjs;
  dosesInDateRange: Dose[];
  dosesForSelectedDay: Dose[];
  groupDosesForSelectedDay: GroupedDose[];
  isLoading: boolean;
  error: string | null;
  doseIdToFocus: string | null; 
  setDoseIdToFocus: (doseId: string | null) => void;
  setSelectedDate: (date: dayjs.Dayjs) => void;
  fetchDosesByDateRange: (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => Promise<void>;
  fetchDosesBySelectedDate: () => Promise<void>;
  updateDoseStatus: (doseId: string, status: DoseStatus.TAKEN | DoseStatus.SKIPPED, reason?: SkipReason) => Promise<void>;
  toggleDosePreparedStatus: (doseId: string) => void;
  rescheduleDose: (doseId: string, newTime: string) => Promise<void>;
  setDoseMealPreference: (doseId: string, preference: MealRelation | null) => void;
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
    if (!acc[timeKey]) acc[timeKey] = [];
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

    // Sử dụng enum để so sánh và gán
    let status: GroupedDoseStatus;
    const allTaken = doseArray.every(d => d.status === DoseStatus.TAKEN);
    const anySkippedOrMissed = doseArray.some(d => d.status === DoseStatus.SKIPPED || d.status === DoseStatus.MISSED);
    const anyPending = doseArray.some(d => d.status === DoseStatus.PENDING);

    if (allTaken) {
      status = GroupedDoseStatus.COMPLETED;
    } else if (anySkippedOrMissed) {
      status = GroupedDoseStatus.MISSED;
    } else if (anyPending && now.isBetween(dueAt.subtract(30, 'minute'), dueAt.add(4, 'hour'))) {
      // Mở rộng khung giờ ACTIVE để khớp với logic MISSED của backend
      status = GroupedDoseStatus.ACTIVE;
    } else {
      status = GroupedDoseStatus.UPCOMING;
    }

    return {
      time: time,
      doses: doseArray,
      timeOfDay: timeOfDay,
      status: status,
    };
  });

  const statusPriority: Record<GroupedDoseStatus, number> = {
    [GroupedDoseStatus.ACTIVE]: 1,
    [GroupedDoseStatus.UPCOMING]: 2,
    [GroupedDoseStatus.MISSED]: 3,
    [GroupedDoseStatus.COMPLETED]: 4,
  };

  processedGroups.sort((a, b) => {
    const priorityA = statusPriority[a.status];
    const priorityB = statusPriority[b.status];
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return dayjs(a.time).valueOf() - dayjs(b.time).valueOf();
  });

  return processedGroups;
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  selectedDate: dayjs(),
  dosesInDateRange: [],
  dosesForSelectedDay: [],
  groupDosesForSelectedDay: [],
  isLoading: false,
  error: null,
  doseIdToFocus: null,

  setDoseIdToFocus: (doseId) => {
    console.log(`[ScheduleStore] Setting doseIdToFocus:`, doseId);
    set({ doseIdToFocus: doseId });
  },

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
      console.warn('[ScheduleStore] Skipped: fetchDosesBySelectedDate - User not authenticated.');
      set({ error: 'User not authenticated.', dosesInDateRange: [], dosesForSelectedDay: [] });
      return;
    }

    const selectedDateStr = get().selectedDate.format('YYYY-MM-DD');
    console.log(`[ScheduleStore] Start: Fetch doses for ${selectedDateStr}`);

    set({ isLoading: true, error: null });

    const previousGroups = get().groupDosesForSelectedDay;

    try {
      const { data, error } = await schedulingClient.query({
        query: GET_DOSES_BY_SELECTED_DATE,
        variables: { selectedDate: get().selectedDate.toISOString() },
        fetchPolicy: 'network-only',
      });

      if (error) throw error;

      const fetchedDoses: Dose[] = data.dosesBySelectedDate || [];
      console.log(`[ScheduleStore] API Success: ${fetchedDoses.length} doses fetched.`);

      const groupedDoses = groupAndProcessDoses(fetchedDoses);
      console.log(`[ScheduleStore] Grouping complete: ${groupedDoses.length} groups created.`);

      const mergedGroups = groupedDoses.map(group => {
        const prevGroup = previousGroups.find(pg => pg.time === group.time);
        return {
          ...group,
          doses: group.doses.map(dose => {
            const prevDose = prevGroup?.doses.find(pd => pd.id === dose.id);
            return {
              ...dose,
              is_prepared: prevDose?.is_prepared ?? false
            };
          })
        };
      });

      set({
        dosesForSelectedDay: fetchedDoses,
        groupDosesForSelectedDay: mergedGroups,
        isLoading: false
      });

      console.log('[ScheduleStore] State updated successfully.');

    } catch (e: any) {
      console.error('[ScheduleStore] API Failure:', e);
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

  updateDoseStatus: async (doseId, status, reason) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const previousDosesForSelectedDay = get().dosesForSelectedDay;

    // Optimistic Update
    set(state => {
      const updatedDosesForDay = state.dosesForSelectedDay.map(dose =>
        dose.id === doseId ? { ...dose, status: status, is_prepared: false } : dose
      );
      const updatedGroupedDoses = groupAndProcessDoses(updatedDosesForDay);

      return {
        dosesForSelectedDay: updatedDosesForDay,
        groupDosesForSelectedDay: updatedGroupedDoses,
      };
    });

    try {
      const updatePayload = {
        id: doseId,
        data: {
          status: status,
          ...(status === DoseStatus.SKIPPED && reason && {
            skipReasonCategory: reason.category,
            skipReasonDetail: reason.detail,
          }),
        },
      };

      await schedulingClient.mutate({
        mutation: UPDATE_DOSES_MUTATION,
        variables: { updates: [updatePayload] },
      });
    } catch (e: any) {
      // Rollback
      set(state => {
        const previousDosesForDay = previousDosesForSelectedDay.filter(dose =>
          dayjs(dose.due_at).isSame(state.selectedDate, 'day')
        );
        const previousGroupedDoses = groupAndProcessDoses(previousDosesForDay);
        return {
          error: `Failed to update status: ${e.message}`,
          dosesForSelectedDay: previousDosesForDay,
          groupDosesForSelectedDay: previousGroupedDoses,
        };
      });
    }
  },

  toggleDosePreparedStatus: (doseId) => {
    set(state => {
      const updatedDosesForDay = state.dosesForSelectedDay.map(dose =>
        dose.id === doseId ? { ...dose, is_prepared: !dose.is_prepared } : dose
      );

      const updatedGroupedDoses = groupAndProcessDoses(updatedDosesForDay);

      return {
        dosesForSelectedDay: updatedDosesForDay,
        groupDosesForSelectedDay: updatedGroupedDoses,
      };
    });
  },

  rescheduleDose: async (doseId: string, newTime: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.warn(`[ScheduleStore] Action: rescheduleDose skipped for dose ${doseId}. Reason: User not authenticated.`);
      return;
    }
    console.log(`[ScheduleStore] Action: rescheduleDose called for dose ${doseId} to new time ${newTime}.`);

    const previousDosesForSelectedDay = get().dosesForSelectedDay;

    console.log('[ScheduleStore] Performing optimistic update for reschedule.');
    set(state => {
      const sanitizedDoses = state.dosesForSelectedDay.map(dose => ({
        ...dose,
        due_at: dayjs(dose.due_at).toISOString(), 
      }));

      const updatedDosesForDay = sanitizedDoses.map(dose =>
        dose.id === doseId ? { ...dose, due_at: newTime } : dose
      );
      
      const updatedGroupedDoses = groupAndProcessDoses(updatedDosesForDay);
      
      return {
        dosesForSelectedDay: updatedDosesForDay,
        groupDosesForSelectedDay: updatedGroupedDoses,
      };
    });

    try {
      const updatePayload = {
        id: doseId,
        data: {
          due_at: newTime,
        },
      };

      await schedulingClient.mutate({
        mutation: UPDATE_DOSES_MUTATION,
        variables: { updates: [updatePayload] },
      });

      console.log(`[ScheduleStore] API Success: Successfully rescheduled dose ${doseId} to ${newTime}.`);
    } catch (e: any) {
      console.error(`[ScheduleStore] API Failure: Failed to reschedule dose. Rolling back.`, e);
      set(state => {
        const previousGroupedDoses = groupAndProcessDoses(previousDosesForSelectedDay);
        return {
          error: `Failed to reschedule dose: ${e.message}`,
          dosesForSelectedDay: previousDosesForSelectedDay,
          groupDosesForSelectedDay: previousGroupedDoses,
        };
      });
    }
  },

  setDoseMealPreference: async (doseId: string, preference: MealRelation | null) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.warn(`[ScheduleStore] Action: setDoseMealPreference skipped for dose ${doseId}. Reason: User not authenticated.`);
      return;
    }

    console.log(`[ScheduleStore] Action: setDoseMealPreference called for dose ${doseId}.`, preference);

    const previousDosesForSelectedDay = get().dosesForSelectedDay;

    console.log('[ScheduleStore] Performing optimistic update for meal preference.');
    set(state => {
      const updateMealPreference = (groupDosesForSelectedDay: GroupedDose[]) =>
        groupDosesForSelectedDay.map(group => ({
          ...group,
          doses: group.doses.map(dose =>
            dose.id === doseId ? { ...dose, meal_relation: preference } : dose
          )
        }));

      const updatedDosesForSelectedDay = updateMealPreference(state.groupDosesForSelectedDay);

      return {
        groupDosesForSelectedDay: updatedDosesForSelectedDay,
      };
    });

    try {
      const updatePayload = {
        id: doseId,
        data: {
          meal_relation: preference,
        },
      };

      await schedulingClient.mutate({
        mutation: UPDATE_DOSES_MUTATION,
        variables: {
          updates: [updatePayload]
        },
      });

      console.log(`[ScheduleStore] API Success: Successfully updated meal preference for dose ${doseId}.`);
    } catch (e: any) {
      // 4. Nếu có lỗi, Rollback lại trạng thái giao diện cũ
      console.error(`[ScheduleStore] API Failure: Failed to update meal preference for dose ${doseId}. Rolling back UI.`, e);
      set(state => {
        const previousDosesForDay = previousDosesForSelectedDay.filter(dose =>
          dayjs(dose.due_at).isSame(state.selectedDate, 'day')
        );
        const previousGroupedDoses = groupAndProcessDoses(previousDosesForDay);

        return {
          error: `Failed to update meal preference: ${e.message}`,
          dosesForSelectedDay: previousDosesForDay,
          groupDosesForSelectedDay: previousGroupedDoses,
        };
      });
    }
  },
}));