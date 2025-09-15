import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Props {
    selectedTime: string | null;
    onConfirm: () => void;
}

const AppointmentFooter: React.FC<Props> = ({ selectedTime, onConfirm }) => (
    <View style={styles.footer}>
        <TouchableOpacity
            style={[styles.bookButton, { opacity: selectedTime ? 1 : 0.7 }]}
            disabled={!selectedTime}
            onPress={onConfirm}
        >
            <Text style={styles.bookButtonText}>Đặt lịch</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    footer: { padding: 15, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
    bookButton: { backgroundColor: COLORS.lightBlue, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    bookButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
});

export default AppointmentFooter;
