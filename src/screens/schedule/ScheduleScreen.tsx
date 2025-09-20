import { schedulingClient } from '@/api/apoloClient';
import { GET_DOSE_DETAILS_BY_ID } from '@/api/queries/doseQueries';
import SegmentedControl from '@/components/common/SegmentedControl';
import AppointmentView from '@/components/specific/schedule/appointment/AppointmentView';
import MedicationScheduleView from '@/components/specific/schedule/medication/MedicationScheduleView';
import { COLORS, SIZES } from '@/constants/theme';
import { MainTabsScreenProps } from '@/navigation/types';
import { useScheduleStore } from '@/store/useScheduleStore';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const dummyAppointments = [
  {
    id: '1',
    date: '2023-10-10',
    time: '09:30 am',
    title: 'Heart Surgeon',
    doctor: 'Dr. Emily White',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    contactType: 'call' as 'call',
  },
  {
    id: '2',
    date: '2023-10-15',
    time: '11:30 am',
    title: 'ECG Test',
    doctor: 'Lab Technician',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    contactType: 'video' as 'video',
  },
  {
    id: '3',
    date: '2023-10-24',
    time: '11:30 am',
    title: 'Medicine Doctor',
    doctor: 'Dr. John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    contactType: 'chat' as 'chat',
  },
  {
    id: '4',
    date: '2023-11-05',
    time: '10:00 am',
    title: 'Dental Checkup',
    doctor: 'Dr. Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    contactType: 'call' as 'call',
  },
  {
    id: '5',
    date: '2023-11-12',
    time: '02:00 pm',
    title: 'Eye Exam',
    doctor: 'Dr. Alex Kim',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    contactType: 'video' as 'video',
  },
  {
    id: '6',
    date: '2023-11-12',
    time: '02:00 pm',
    title: 'Eye Exam',
    doctor: 'Dr. Alex Kim',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    contactType: 'video' as 'video',
  },
];
type ScheduleScreenRouteProp = MainTabsScreenProps<'Schedule'>['route'];

const ScheduleScreen: React.FC = () => {
  const route = useRoute<ScheduleScreenRouteProp>();
  const navigation = useNavigation();

  // Lấy các action từ store
  const setSelectedDate = useScheduleStore(state => state.setSelectedDate);
  const setDoseIdToFocus = useScheduleStore(state => state.setDoseIdToFocus);

  useFocusEffect(
    useCallback(() => {
      const doseIds = route.params?.doseIdsToFocus;

      if (doseIds && doseIds.length > 0) {
        const firstDoseId = doseIds[0];
        console.log(`[ScheduleScreen] Focus effect detected doseIdsToFocus:`, doseIds);

        const findAndNavigate = async (doseId: string) => {
          try {
            console.log(`[ScheduleScreen] Looking up details for doseId: ${doseId}`);

            const { data } = await schedulingClient.query({
              query: GET_DOSE_DETAILS_BY_ID,
              variables: { id: doseId },
              fetchPolicy: 'network-only',
            });

            const targetDose = data?.doseById;

            if (targetDose && targetDose.due_at) {
              const targetDate = dayjs(targetDose.due_at);

              console.log(`[ScheduleScreen] Dose found. Navigating to date: ${targetDate.format('YYYY-MM-DD')}`);

              // 1. Chuyển đến đúng ngày
              setSelectedDate(targetDate);

              // 2. Set ID cần focus vào store
              setDoseIdToFocus(firstDoseId);

              // 3. Xóa params để tránh lặp lại
              navigation.setParams({ doseIdsToFocus: undefined } as any);
            } else {
              console.warn(`[ScheduleScreen] Dose with ID ${doseId} not found on server.`);
              // Vẫn xóa params để tránh lỗi lặp
              navigation.setParams({ doseIdsToFocus: undefined } as any);
            }
          } catch (error) {
            console.error(`[ScheduleScreen] Failed to fetch dose details for ID ${doseId}`, error);
            navigation.setParams({ doseIdsToFocus: undefined } as any);
          }
        };

        findAndNavigate(firstDoseId);
      }
    }, [route.params?.doseIdsToFocus]) // Chỉ chạy lại callback này khi params thay đổi
  );

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(-selectedTabIndex * screenWidth, { duration: 300, easing: Easing.out(Easing.quad) }) }],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch trình uống thuốc</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity><Ionicons name="search-outline" size={24} color={COLORS.textDark} /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="notifications-outline" size={24} color={COLORS.textDark} /></TouchableOpacity>
          </View>
        </View>

        <SegmentedControl
          options={['Lịch uống thuốc', 'Lịch hẹn khám']}
          selectedIndex={selectedTabIndex}
          onOptionPress={setSelectedTabIndex}
        />

        <View style={styles.contentWrapper}>
          <Animated.View
            style={[
              styles.contentSlider,
              { width: screenWidth * 2 },
              contentAnimatedStyle
            ]}
          >
            <View style={{ width: screenWidth, flex: 1 }}>
              <MedicationScheduleView />
            </View>
            <View style={{ width: screenWidth, flex: 1 }}>
              <AppointmentView appointments={dummyAppointments} />
            </View>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 0.8,
    paddingTop: SIZES.padding * 0.6,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    bottom: 2,
    overflow: 'hidden',
  },
  contentSlider: {
    flex: 1,
    flexDirection: 'row',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default ScheduleScreen;