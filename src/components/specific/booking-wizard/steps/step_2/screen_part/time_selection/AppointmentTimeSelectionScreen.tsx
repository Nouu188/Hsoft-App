import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { BookingStackParamList } from '@/navigation/BookingScreenNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOWS, SIZES } from '@/constants/theme';
import AppointmentHeader from './AppointmentHeader';
import TimeSlotSection from './TimeSlotSection';
import NoteSection from './NoteSection';
import AppointmentFooter from './AppointmentFooter';

export interface TimeSlot {
    time: string;
    isAvailable: boolean;
}

type AppointmentRouteProp = RouteProp<BookingStackParamList, 'AppointmentBooking'>;
type BookingNavigationProp = NativeStackNavigationProp<BookingStackParamList, 'AppointmentBooking'>;

const AppointmentTimeSelectionScreen: React.FC = () => {
    const navigation = useNavigation<BookingNavigationProp>();
    const route = useRoute<AppointmentRouteProp>();
    const { availableTimes, onSelectTime } = route.params;

    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const extractHour = (timeRange: string): number => {
        const [start] = timeRange.split('-').map(t => t.trim());
        const [hourStr] = start.split(':');
        return parseInt(hourStr, 10);
    };

    const groupedSlots = useMemo(() => {
        const morning: TimeSlot[] = [];
        const afternoon: TimeSlot[] = [];
        const evening: TimeSlot[] = [];

        availableTimes?.forEach(slot => {
            const hour = extractHour(slot.time);
            if (hour < 12) morning.push(slot);
            else if (hour >= 12 && hour < 17) afternoon.push(slot);
            else evening.push(slot);
        });

        return { morning, afternoon, evening };
    }, [availableTimes]);

    const handleConfirm = () => {
        if (selectedTime && onSelectTime) {
            onSelectTime(selectedTime);
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppointmentHeader onBack={() => navigation.goBack()} />

            <ScrollView style={styles.container}>
                <TimeSlotSection
                    title="Buổi sáng"
                    slots={groupedSlots.morning}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                />
                <TimeSlotSection
                    title="Buổi chiều"
                    slots={groupedSlots.afternoon}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                />
                <TimeSlotSection
                    title="Buổi tối"
                    slots={groupedSlots.evening}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                />

                <NoteSection />
            </ScrollView>

            <AppointmentFooter
                selectedTime={selectedTime}
                onConfirm={handleConfirm}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, padding: 15 },
});

export default AppointmentTimeSelectionScreen;
