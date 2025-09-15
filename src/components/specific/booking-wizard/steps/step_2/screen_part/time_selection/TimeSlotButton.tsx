import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import { TimeSlot } from './AppointmentTimeSelectionScreen';
interface Props {
    slot: TimeSlot;
    selectedTime: string | null;
    onSelect: (time: string) => void;
}

const TimeSlotButton: React.FC<Props> = ({ slot, selectedTime, onSelect }) => (
    <TouchableOpacity
        key={slot.time}
        style={[
            styles.timeSlotButton,
            !slot.isAvailable && styles.timeSlotButtonUnavailable,
            selectedTime === slot.time && styles.timeSlotButtonSelected,
        ]}
        disabled={!slot.isAvailable}
        onPress={() => slot.isAvailable && onSelect(slot.time)}
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

const styles = StyleSheet.create({
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
    timeSlotButtonUnavailable: { backgroundColor: COLORS.lightGray, borderColor: COLORS.border },
    timeSlotButtonSelected: { backgroundColor: COLORS.lightBlue, borderColor: COLORS.lightBlue },
    timeSlotText: { fontSize: 14, color: COLORS.lightBlue, fontWeight: '500' },
    timeSlotTextUnavailable: { color: COLORS.placeHolderIcon },
    timeSlotTextSelected: { color: COLORS.white },
});

export default TimeSlotButton;
