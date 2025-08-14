import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import { useScheduleStore } from '@/store/useScheduleStore';
import { GroupedDose, DoseStatus, GroupedDoseStatus } from '@/types';
import { FilterState } from '../components/DoseFilter';
import { SIZES } from '@/constants/theme';

export const useMedicationSchedule = () => {
    // --- Lấy State và Actions từ Store ---
    const groupDosesForSelectedDay = useScheduleStore(state => state.groupDosesForSelectedDay);
    const isLoading = useScheduleStore(state => state.isLoading);
    const error = useScheduleStore(state => state.error);
    const selectedDate = useScheduleStore(state => state.selectedDate);
    const doseIdToFocus = useScheduleStore(state => state.doseIdToFocus);

    const {
        fetchDosesBySelectedDate,
        updateDoseStatus,
        toggleDosePreparedStatus,
        setDoseMealPreference,
        rescheduleDose,
        setDoseIdToFocus,
    } = useScheduleStore.getState();

    // --- State Cục bộ ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ status: 'ALL', timeOfDay: [] });
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const flatListRef = useRef<FlatList<GroupedDose>>(null);

    // --- Logic Fetch Dữ liệu ---
    useEffect(() => {
        fetchDosesBySelectedDate();
    }, [selectedDate, fetchDosesBySelectedDate]);

    const onRefresh = useCallback(() => {
        fetchDosesBySelectedDate();
    }, [fetchDosesBySelectedDate]);

    // --- Logic Lọc Dữ liệu ---
    const filteredData = useMemo(() => {
        if (!groupDosesForSelectedDay) return [];
        let data = groupDosesForSelectedDay;
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            data = data
                .map(group => ({
                    ...group,
                    doses: group.doses.filter(dose =>
                        dose.medication_name.toLowerCase().includes(lowercasedQuery)
                    ),
                }))
                .filter(group => group.doses.length > 0);
        }
        if (filters.status !== 'ALL') {
            if (filters.status === 'ACTION_NEEDED') {
                data = data.filter(g => g.status === GroupedDoseStatus.ACTIVE || g.status === GroupedDoseStatus.MISSED);
            } else {
                data = data.filter(g => g.status === (filters.status as GroupedDoseStatus));
            }
        }
        return data;
    }, [groupDosesForSelectedDay, filters, searchQuery]);

    // --- Logic Điều hướng Cuộn ---
    useEffect(() => {
        if (doseIdToFocus && groupDosesForSelectedDay.length > 0) {
            const targetGroupIndex = groupDosesForSelectedDay.findIndex(group =>
                group.doses.some(dose => dose.id === doseIdToFocus)
            );

            if (targetGroupIndex !== -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index: targetGroupIndex,
                        animated: true,
                        viewPosition: 0,
                        viewOffset: SIZES.padding,
                    });
                    setDoseIdToFocus(null);
                }, 200);
            } else {
                setDoseIdToFocus(null);
            }
        }
    }, [doseIdToFocus, groupDosesForSelectedDay, setDoseIdToFocus]);

    // --- Handlers (được memoized với useCallback) ---
    const handleMarkAsTaken = useCallback((doseIds: string[]) => {
        doseIds.forEach(doseId => {
            const doseToUpdate = groupDosesForSelectedDay
                .flatMap(g => g.doses)
                .find(d => d.id === doseId);
            if (doseToUpdate && doseToUpdate.status !== DoseStatus.TAKEN) {
                updateDoseStatus(doseId, DoseStatus.TAKEN);
            }
        });
    }, [groupDosesForSelectedDay, updateDoseStatus]);


    const handleSkipDose = useCallback((doseId: string, reason: { category: string; detail?: string }) => {
        updateDoseStatus(doseId, DoseStatus.SKIPPED, reason);
    }, [updateDoseStatus]);

    const handleRescheduleDose = useCallback((doseId: string, newTime: string) => {
        rescheduleDose(doseId, newTime);
    }, [rescheduleDose]);

    const handleNavigateToTime = useCallback((time: string) => {
        const indexInFilteredList = filteredData.findIndex(
            group => new Date(group.time).getTime() === new Date(time).getTime()
        );
        if (indexInFilteredList !== -1) {
            flatListRef.current?.scrollToIndex({
                index: indexInFilteredList,
                animated: true,
                viewPosition: 0,
                viewOffset: SIZES.padding,
            });
        } else {
            setFilters({ status: 'ALL', timeOfDay: [] });
            setSearchQuery('');
            setTimeout(() => {
                const indexInFullList = groupDosesForSelectedDay.findIndex(
                    group => new Date(group.time).getTime() === new Date(time).getTime()
                );
                if (indexInFullList !== -1) {
                    flatListRef.current?.scrollToIndex({
                        index: indexInFullList,
                        animated: true,
                        viewPosition: 0,
                        viewOffset: SIZES.padding,
                    });
                }
            }, 150);
        }
    }, [filteredData, groupDosesForSelectedDay]);

    const activeFilterCount = useMemo(() => (filters.status !== 'ALL' ? 1 : 0), [filters.status]);

    return {
        // State
        isLoading,
        error,
        filteredData,
        groupDosesForSelectedDay,
        searchQuery,
        filters,
        isFilterModalVisible,
        activeFilterCount,
        flatListRef,
        // Handlers
        onRefresh,
        setSearchQuery,
        setFilters,
        setFilterModalVisible,
        handleMarkAsTaken,
        toggleDosePreparedStatus,
        handleNavigateToTime,
        handleSkipDose,
        handleRescheduleDose,
        setDoseMealPreference,
    };
};