import { COLORS, SIZES } from "@/constants/theme";
import { useScheduleStore } from "@/store/useScheduleStore";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"; // Thay FlatList bằng ScrollView
import { useState, useMemo, useEffect, useRef } from "react";
import TimeSlotCard from "./TimeSlotCard";
import SearchBar from "@/components/common/SearchBar";
import FilterModal from "./FilterModal";
import { FilterState } from "@/screens/schedule/DoseFilter";
import Animated from 'react-native-reanimated';
import DateSelector from "./DateSelector";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const MedicationScheduleView = () => {
    const groupDosesForSelectedDay = useScheduleStore(state => state.groupDosesForSelectedDay);
    const isLoading = useScheduleStore(state => state.isLoading);
    const error = useScheduleStore(state => state.error);
    const updateDoseStatus = useScheduleStore(state => state.updateDoseStatus);
    const toggleDosePreparedStatus = useScheduleStore(state => state.toggleDosePreparedStatus);
    const setDoseMealPreference = useScheduleStore(state => state.setDoseMealPreference)

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

    const scrollRef = useRef<ScrollView>(null);
    const layoutMap = useRef(new Map<string, number>());

    const handleNavigateToTime = (time: string) => {
        const y = layoutMap.current.get(time);
        if (y !== undefined && scrollRef.current) {
            scrollRef.current.scrollTo({ y, animated: true });
        }
    };

    const handleSkipDose = (doseId: string) => {
        updateDoseStatus(doseId, 'SKIPPED');
    };

    const handleRescheduleDose = (doseId: string, newTime: string) => {
        // Gọi action từ store
    };

    const activeFilterCount = filters.status !== 'ALL' ? 1 : 0;

    if (isLoading) {
        return <View style={[styles.container, styles.centeredContent]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }
    if (error) {
        return <View style={[styles.container, styles.centeredContent]}><Text style={styles.errorText}>Lỗi: {error}</Text></View>;
    }

    const renderContent = () => {
        if (isLoading && !groupDosesForSelectedDay.length) {
            return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
        }
        if (error) {
            return <Text style={styles.errorText}>Lỗi: {error}</Text>;
        }
        if (filteredData.length === 0) {
            return (
                <View style={styles.centeredContent}>
                    <Text style={styles.emptyText}>
                        {groupDosesForSelectedDay.length > 0
                            ? 'Không có lịch uống thuốc phù hợp.'
                            : 'Không có lịch uống thuốc cho ngày này.'}
                    </Text>
                </View>
            );
        }
        return filteredData.map(item => (
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
        ));
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
                refreshControl={
                    <RefreshControl refreshing={isLoading} tintColor={COLORS.primary} />
                }
            >
                <DateSelector />

                <View style={styles.searchBarContainer}>
                    <SearchBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onFilterPress={() => setFilterModalVisible(true)}
                        activeFilterCount={activeFilterCount}
                    />
                </View>

                {/* Nội dung chính */}
                <View style={styles.content}>
                    {renderContent()}
                </View>
            </ScrollView>

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
    searchBarContainer: {
        paddingTop: SIZES.padding / 2,
        paddingBottom: SIZES.padding,
        backgroundColor: COLORS.white, // Nền cho search bar khi sticky
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
});

export default MedicationScheduleView;