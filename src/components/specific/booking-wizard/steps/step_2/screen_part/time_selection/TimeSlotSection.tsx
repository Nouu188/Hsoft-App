import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TimeSlotButton from './TimeSlotButton';
import { COLORS } from '@/constants/theme';
import { TimeSlot } from './AppointmentTimeSelectionScreen';

interface Props {
    title: string;
    slots: TimeSlot[];
    selectedTime: string | null;
    setSelectedTime: (time: string) => void;
}

const TimeSlotSection: React.FC<Props> = ({ title, slots, selectedTime, setSelectedTime }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.timeSlotsContainer}>
            {slots.length > 0
                ? slots.map(slot => (
                    <TimeSlotButton
                        key={slot.time}
                        slot={slot}
                        selectedTime={selectedTime}
                        onSelect={setSelectedTime}
                    />
                ))
                : <Text style={styles.noSlotText}>Không có lịch</Text>}
        </View>
    </View>
);

const styles = StyleSheet.create({
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    noSlotText: { fontSize: 14, color: COLORS.placeHolderIcon, fontStyle: 'italic' },
});

export default TimeSlotSection;
