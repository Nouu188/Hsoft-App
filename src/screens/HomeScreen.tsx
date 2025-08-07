import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, useWindowDimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useAuthStore } from '@/store/useAuthStore';
import DoseList from '@/components/specific/schedule/DoseList';
import DateSelector from '@/components/specific/schedule/DateSelector';
import dayjs from 'dayjs';

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<{ type: string }>);

const HomeScreen: React.FC = () => {
  const selectedDate = useScheduleStore(state => state.selectedDate);
  const fetchDosesBySelectedDate = useScheduleStore(state => state.fetchDosesBySelectedDate);
  const isLoading = useScheduleStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);

  const [isParentScrollEnabled, setParentScrollEnabled] = useState(true);

  const { height: screenHeight } = useWindowDimensions();
  const INITIAL_BG_HEIGHT = screenHeight * 0.4;
  const MIN_BG_HEIGHT = 80;
  const SCROLL_DISTANCE_TO_SHRINK = INITIAL_BG_HEIGHT - MIN_BG_HEIGHT;

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE_TO_SHRINK],
      [INITIAL_BG_HEIGHT, MIN_BG_HEIGHT],
      'clamp'
    );
    return {
      height: height,
    };
  });

  const onFetch = useCallback(() => { if (user) { fetchDosesBySelectedDate(); } }, [user, fetchDosesBySelectedDate, selectedDate]);
  useEffect(() => { onFetch(); }, [onFetch]);
  const onRefresh = useCallback(() => { onFetch(); }, [onFetch]);
  const screenSections = [
    { type: 'header', id: 'header' },
    { type: 'date_selector', id: 'date_selector' },
    { type: 'dose_list', id: 'dose_list' },
    { type: 'footer_spacer', id: 'footer_spacer' },
  ];
  const renderSection = ({ item }: { item: { type: string } }) => {
    switch (item.type) {
      case 'header':
        return (
          <>
            <View style={styles.header}>
              <Text style={styles.greeting}>Chào buổi sáng{'\n'}<Text style={styles.userName}>Thịnh</Text></Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="search-outline" size={23} color={COLORS.lightGray} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="notifications-outline" size={23} color={COLORS.lightGray} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Lịch trình của bạn</Text>
              <Text style={styles.monthTitle}>Tháng {dayjs().month() + 1}</Text>
            </View>
          </>
        );
      case 'date_selector':
        return <DateSelector />;
      case 'dose_list':
        return (
          <DoseList
            onEnterScrollArea={() => setParentScrollEnabled(false)}
            onLeaveScrollArea={() => setParentScrollEnabled(true)}
          />
        );
      case 'footer_spacer':
        return <View style={{ height: 100 }} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <Animated.View style={[styles.background, animatedBackgroundStyle]} />

      <AnimatedFlatList
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        scrollEnabled={isParentScrollEnabled}
        data={screenSections}
        renderItem={renderSection}
        keyExtractor={(item) => item.type}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 0.4,
    marginBottom: SIZES.padding * 0.4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.white
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.lightGray,
  },
});

export default HomeScreen;