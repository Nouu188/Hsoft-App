import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { BookingStackParamList } from '@/navigation/BookingWizardNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOWS, SIZES } from '@/constants/theme';

export interface TimeSlot {
    time: string;
    isAvailable: boolean;
}

type AppointmentRouteProp = RouteProp<BookingStackParamList, 'AppointmentBooking'>;
type BookingNavigationProp = NativeStackNavigationProp<BookingStackParamList, 'AppointmentBooking'>;

const AppointmentTimeSelectionScreen: React.FC = () => {
    const navigation = useNavigation<BookingNavigationProp>();
    const route = useRoute<AppointmentRouteProp>();
    const { availableTimes, doctorId, onSelectTime } = route.params;

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

    const handleSelectTime = (time: string) => setSelectedTime(time);

    const handleConfirm = () => {
        if (selectedTime && onSelectTime) {
            onSelectTime(selectedTime);
            navigation.goBack();
        }
    };


    const renderTimeSlot = (slot: TimeSlot) => (
        <TouchableOpacity
            key={slot.time}
            style={[
                styles.timeSlotButton,
                !slot.isAvailable && styles.timeSlotButtonUnavailable,
                selectedTime === slot.time && styles.timeSlotButtonSelected,
            ]}
            disabled={!slot.isAvailable}
            onPress={() => slot.isAvailable && handleSelectTime(slot.time)}
        >
            <Text
                style={[
                    styles.timeSlotText,
                    !slot.isAvailable && styles.timeSlotTextUnavailable,
                    selectedTime === slot.time && styles.timeSlotTextSelected,
                ]}
            >
                {slot.time}
            </Text>
        </TouchableOpacity>
    );

    const renderSection = (title: string, slots: TimeSlot[]) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.timeSlotsContainer}>
                {slots.length > 0 ? slots.map(renderTimeSlot) : <Text style={styles.noSlotText}>Không có lịch</Text>}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chọn giờ khám</Text>
                <View style={styles.iconButton} />
            </View>

            {/* Content */}
            <ScrollView style={styles.container}>
                {renderSection('Buổi sáng', groupedSlots.morning)}
                {renderSection('Buổi chiều', groupedSlots.afternoon)}
                {renderSection('Buổi tối', groupedSlots.evening)}

                {/* Note giống bản 1 */}
                <View style={styles.noteSection}>
                    <Text style={styles.noteTitle}>Chú thích:</Text>
                    <View style={styles.noteItem}>
                        <View style={[styles.noteIndicator, styles.noteIndicatorFull]} />
                        <Text style={styles.noteText}>Khung giờ đặt khám Online đã đầy</Text>
                    </View>
                    <View style={styles.noteItem}>
                        <View style={[styles.noteIndicator, styles.noteIndicatorAvailable]} />
                        <Text style={styles.noteText}>Khung giờ có thể đặt khám Online</Text>
                    </View>
                    <Text style={styles.noteSubText}>Bạn vui lòng chọn khung giờ khác để tiếp tục.</Text>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.bookButton, { opacity: selectedTime ? 1 : 0.7 }]}
                    disabled={!selectedTime}
                    onPress={handleConfirm}
                >
                    <Text style={styles.bookButtonText}>Đặt lịch</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginTop: SIZES.padding * 2,
    },
    iconButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    container: { flex: 1, padding: 15 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    timeSlotButton: {
        backgroundColor: '#e6f7ff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#91d5ff',
        minWidth: 100,
        alignItems: 'center',
    },
    timeSlotButtonUnavailable: { backgroundColor: COLORS.background, borderColor: COLORS.background },
    timeSlotButtonSelected: { backgroundColor: COLORS.lightBlue, borderColor: COLORS.lightBlue },
    timeSlotText: { fontSize: 14, color: COLORS.lightBlue, fontWeight: '500' },
    timeSlotTextUnavailable: { color: COLORS.placeHolderIcon },
    timeSlotTextSelected: { color: COLORS.white },
    noSlotText: { fontSize: 14, color: COLORS.placeHolderIcon, fontStyle: 'italic' },
    noteSection: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#1890ff',
        ...SHADOWS.medium,
    },
    noteTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    noteItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    noteIndicator: { width: 12, height: 12, borderRadius: 2, marginRight: 8, borderWidth: 1 },
    noteIndicatorFull: { backgroundColor: COLORS.background, borderColor: COLORS.background },
    noteIndicatorAvailable: { backgroundColor: '#e6f7ff', borderColor: '#91d5ff' },
    noteText: { fontSize: 14, color: '#555' },
    noteSubText: { fontSize: 13, color: '#777', marginTop: 10, fontStyle: 'italic' },
    footer: { padding: 15, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
    bookButton: { backgroundColor: COLORS.lightBlue, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    bookButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
});

export default AppointmentTimeSelectionScreen;
