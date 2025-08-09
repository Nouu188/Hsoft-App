import { COLORS, SIZES } from "@/constants/theme";
import { useScheduleStore } from "@/store/useScheduleStore";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import TimeSlotCard from "./components/TimeSlotCard";
import SearchBar from "@/components/common/SearchBar";
import FilterModal from "../shared/FilterModal";
import { FilterState } from "@/components/specific/schedule/medication/components/DoseFilter";
import DateSelector from "../shared/DateSelector";
import { GroupedDose } from "@/types/dtos/dose/grouped-dose.dto";
import TimeSlotCardSkeleton from "./components/TimeSlotCardSkeleton";

const MedicationScheduleView = () => {
    const groupDosesForSelectedDay = useScheduleStore(state => state.groupDosesForSelectedDay);
    const isLoading = useScheduleStore(state => state.isLoading);
    const error = useScheduleStore(state => state.error);
    const selectedDate = useScheduleStore(state => state.selectedDate)
    const updateDoseStatus = useScheduleStore(state => state.updateDoseStatus);
    const toggleDosePreparedStatus = useScheduleStore(state => state.toggleDosePreparedStatus);
    const setDoseMealPreference = useScheduleStore(state => state.setDoseMealPreference);
    const fetchDosesBySelectedDate = useScheduleStore(state => state.fetchDosesBySelectedDate);

    const onFetch = useCallback(() => {
        fetchDosesBySelectedDate();
    }, []);

    useEffect(() => {
        onFetch();
    }, [selectedDate, fetchDosesBySelectedDate]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({ status: 'ALL', timeOfDay: [] });
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    const filteredData = useMemo(() => {
        if (!groupDosesForSelectedDay) return [];

        let data = [...groupDosesForSelectedDay];

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            data = data
                .map(group => {
                    const matchingDoses = group.doses.filter(dose =>
                        dose.medication_name.toLowerCase().includes(lowercasedQuery)
                    );
                    return { ...group, doses: matchingDoses };
                })
                .filter(group => group.doses.length > 0);
        }

        if (filters.status !== 'ALL') {
            if (filters.status === 'ACTION_NEEDED') {
                data = data.filter(g => g.status === 'ACTIVE' || g.status === 'MISSED');
            } else {
                data = data.filter(g => g.status === filters.status);
            }
        }

        return data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }, [groupDosesForSelectedDay, filters, searchQuery]);

    const handleMarkAllAsTaken = (time: string) => {
        const group = groupDosesForSelectedDay.find(g => g.time === time);
        if (group) {
            group.doses.forEach(dose => {
                if (dose.status !== 'TAKEN') {
                    updateDoseStatus(dose.id, 'TAKEN');
                }
            });
        }
    };

    const flatListRef = useRef<FlatList<GroupedDose>>(null);

    const handleNavigateToTime = (time: string) => {
        const indexInFullList = groupDosesForSelectedDay.findIndex(
            group => new Date(group.time).getTime() === new Date(time).getTime()
        );

        if (indexInFullList === -1) {
            console.warn(`Could not find the target time slot in the original data source.`);
            return;
        }

        const onScrollEnd = () => {
            console.log('Scrolling animation finished.');
        };

        const isFilterActive = filters.status !== 'ALL' || searchQuery !== '';


        if (isFilterActive) {
            console.log('Filters are active. Clearing them temporarily to scroll.');
            setFilters({ status: 'ALL', timeOfDay: [] });
            setSearchQuery('');

            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                        index: indexInFullList,
                        animated: true,
                        viewPosition: 0,
                        viewOffset: SIZES.padding
                    });
                    setTimeout(onScrollEnd, 400);
                }
            }, 100);

        } else {
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                    index: indexInFullList,
                    animated: true,
                    viewPosition: 0,
                    viewOffset: SIZES.padding,
                });
                setTimeout(onScrollEnd, 500);
            }
            console.log(flatListRef.current)
        }
    };

    const handleSkipDose = (doseId: string) => {
        updateDoseStatus(doseId, 'SKIPPED');
    };

    const handleRescheduleDose = (doseId: string, newTime: string) => {
        // Gọi action từ store
    };

    const activeFilterCount = filters.status !== 'ALL' ? 1 : 0;

    if (error) {
        return <View style={[styles.container, styles.centeredContent]}><Text style={styles.errorText}>Lỗi: {error}</Text></View>;
    }

    const renderDoseItem = ({ item }: { item: GroupedDose }) => (
        <TimeSlotCard
            key={item.time}
            group={item}
            onMarkAllAsTaken={handleMarkAllAsTaken}
            onTogglePrepared={toggleDosePreparedStatus}
            allDosesForDay={groupDosesForSelectedDay}
            onNavigateToTime={handleNavigateToTime}
            onSkipDose={handleSkipDose}
            onRescheduleDose={handleRescheduleDose}
            onSetMealPreference={setDoseMealPreference}
        />
    );

    const renderEmptyListComponent = () => {
        if (isLoading || error) return null;

        return (
            <View style={styles.centeredContent}>
                <Text style={styles.emptyText}>
                    {groupDosesForSelectedDay.length > 0
                        ? 'Không có lịch uống thuốc phù hợp.'
                        : 'Không có lịch uống thuốc cho ngày này.'}
                </Text>
            </View>
        );
    };

    const renderSkeleton = () => (
        <View style={{ paddingHorizontal: SIZES.padding, paddingTop: 12 }}>
            <TimeSlotCardSkeleton />
            <TimeSlotCardSkeleton />
            <TimeSlotCardSkeleton />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.staticHeader}>
                <View style={styles.dateSelectorContainer}>
                    <DateSelector />
                </View>
                <View style={styles.searchBarContainer}>
                    <SearchBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onFilterPress={() => setFilterModalVisible(true)}
                        activeFilterCount={activeFilterCount}
                    />
                </View>
            </View>

            {isLoading ? (
                renderSkeleton()
            ) : (
                <FlatList
                    style={styles.list}
                    ref={flatListRef}
                    data={filteredData}
                    renderItem={renderDoseItem}
                    keyExtractor={item => item.time}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyListComponent}
                    contentContainerStyle={{ paddingHorizontal: SIZES.padding, paddingBottom: 100, paddingTop: 12 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={onFetch}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}

            <FilterModal
                visible={isFilterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                currentFilters={filters}
                onApply={setFilters}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollView: {
        flex: 1,
    },
    dateSelectorContainer: {
        paddingTop: SIZES.padding / 2,
    },
    searchBarContainer: {
        paddingTop: SIZES.padding / 2,
        paddingBottom: SIZES.padding / 1.5,
        backgroundColor: COLORS.white,
    },
    content: {
        paddingHorizontal: SIZES.padding,
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: SIZES.padding,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 16,
        textAlign: 'center',
    },
    scrollIndicator: {
        position: 'absolute',
        bottom: 2,
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    scrollIndicatorText: {
        marginLeft: 5,
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    list: {
        flex: 1,
    },
    staticHeader: {
        backgroundColor: COLORS.white,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        zIndex: 10,
    },
});

export default MedicationScheduleView;