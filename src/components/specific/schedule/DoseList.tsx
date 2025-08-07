import { COLORS, SIZES } from "@/constants/theme";
import { useScheduleStore } from "@/store/useScheduleStore";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"; // Thay FlatList bằng ScrollView
import { useState, useMemo, useEffect, useRef } from "react";
import TimeSlotCard from "./TimeSlotCard";
import SearchBar from "@/components/common/SearchBar";
import FilterModal from "./FilterModal";
import { FilterState } from "@/screens/schedule/DoseFilter";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import Ionicons from "@react-native-vector-icons/ionicons";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface DoseListProps {
  onEnterScrollArea: () => void;
  onLeaveScrollArea: () => void;
}

const DoseList: React.FC<DoseListProps> = ({ onEnterScrollArea, onLeaveScrollArea }) => {
  const groupDosesForSelectedDay = useScheduleStore(state => state.groupDosesForSelectedDay);
  const isLoading = useScheduleStore(state => state.isLoading);
  const error = useScheduleStore(state => state.error);
  const updateDoseStatus = useScheduleStore(state => state.updateDoseStatus);
  const toggleDosePreparedStatus = useScheduleStore(state => state.toggleDosePreparedStatus);
  const setDoseMealPreference = useScheduleStore(state => state.setDoseMealPreference)

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ status: 'ALL', timeOfDay: [] });
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const isAtBottom = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const { layoutMeasurement, contentOffset, contentSize } = event;

      const isScrolledToEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
      isAtBottom.value = isScrolledToEnd;
    },
  });

  const bounceAnim = useSharedValue(0);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isAtBottom.value ? 0 : 1, { duration: 300 }),
      transform: [
        { translateY: withTiming(isAtBottom.value ? 10 : 0, { duration: 300 }) },
        { translateY: bounceAnim.value }
      ],
    };
  });

  useEffect(() => {
    bounceAnim.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true
    );
  }, []);

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

  return (
    <View 
      style={styles.container}
      onTouchStart={onEnterScrollArea}
      onTouchEnd={onLeaveScrollArea}
    >
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setFilterModalVisible(true)}
        activeFilterCount={activeFilterCount}
      />

      <AnimatedScrollView
        style={styles.list}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: SIZES.padding }}
      >
        {filteredData.length > 0 ? (
          filteredData.map(item => (
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
          ))
        ) : (
          <View style={styles.centeredContent}>
            <Text style={styles.emptyText}>
              {groupDosesForSelectedDay.length > 0
                ? 'Không có lịch uống thuốc phù hợp.'
                : 'Không có lịch uống thuốc cho ngày này.'}
            </Text>
          </View>
        )}
      </AnimatedScrollView>

      {filteredData.length > 2 && (
        <Animated.View style={[styles.scrollIndicator, animatedIndicatorStyle]}>
          <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
          <Text style={styles.scrollIndicatorText}>Còn tiếp</Text>
        </Animated.View>
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
    height: 500,
    backgroundColor: '#e8edf39e',
    borderRadius: SIZES.radius * 2,
    marginHorizontal: SIZES.padding * 0.8,
    paddingTop: SIZES.padding * 0.6,
    display: 'flex',
    flexDirection: 'column',
  },
  list: {
    flex: 1,
    marginTop: SIZES.padding / 4,
    marginHorizontal: 12
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

export default DoseList;