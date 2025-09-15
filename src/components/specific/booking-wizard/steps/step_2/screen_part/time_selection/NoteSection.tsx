import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '@/constants/theme';

const NoteSection: React.FC = () => (
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
);

const styles = StyleSheet.create({
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
    noteIndicatorFull: { backgroundColor: COLORS.lightGray, borderColor: COLORS.border },
    noteIndicatorAvailable: { backgroundColor: '#e6f7ff', borderColor: '#91d5ff' },
    noteText: { fontSize: 14, color: '#555' },
    noteSubText: { fontSize: 13, color: '#777', marginTop: 10, fontStyle: 'italic' },
});

export default NoteSection;
