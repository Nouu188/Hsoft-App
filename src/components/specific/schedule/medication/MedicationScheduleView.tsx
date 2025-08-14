import { COLORS, SIZES } from "@/constants/theme";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useCallback } from "react";
import TimeSlotCard from "./components/TimeSlotCard";
import SearchBar from "@/components/common/SearchBar";
import FilterModal from "../shared/FilterModal";
import DateSelector from "../shared/DateSelector";
import { GroupedDose } from "@/types/dtos/dose/grouped-dose.dto";
import TimeSlotCardSkeleton from "./components/TimeSlotCardSkeleton";
import { useMedicationSchedule } from "./hooks/useMedicationSchedule";

const MedicationScheduleView = () => {
    const {
        isLoading,
        error,
        filteredData,
        groupDosesForSelectedDay,
        searchQuery,
        filters,
        isFilterModalVisible,
        activeFilterCount,
        flatListRef,
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
    } = useMedicationSchedule();
    
    const renderDoseItem = useCallback(({ item }: { item: GroupedDose }) => (
        <TimeSlotCard
            group={item}
            onMarkAsTaken={handleMarkAsTaken}
            onTogglePrepared={toggleDosePreparedStatus}
            allDosesForDay={groupDosesForSelectedDay}
            onNavigateToTime={handleNavigateToTime}
            onSkipDose={handleSkipDose}
            onRescheduleDose={handleRescheduleDose}
            onSetMealPreference={setDoseMealPreference}
        />
    ), [groupDosesForSelectedDay, handleMarkAsTaken, toggleDosePreparedStatus, handleNavigateToTime, handleSkipDose, handleRescheduleDose, setDoseMealPreference]);
    
    const renderEmptyListComponent = () => {
        if (isLoading) return null;
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

    if (error) {
        return <View style={[styles.container, styles.centeredContent]}><Text style={styles.errorText}>Lỗi: {error}</Text></View>;
    }

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

            {isLoading && groupDosesForSelectedDay.length === 0 ? (
                renderSkeleton()
            ) : (
                <FlatList
                    ref={flatListRef}
                    style={styles.list}
                    data={filteredData}
                    renderItem={renderDoseItem}
                    keyExtractor={item => item.time}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyListComponent}
                    contentContainerStyle={{ paddingHorizontal: SIZES.padding, paddingBottom: 100, paddingTop: 12 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={onRefresh}
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
    dateSelectorContainer: {
        paddingTop: SIZES.padding / 3,
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