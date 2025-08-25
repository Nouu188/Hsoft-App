import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MedicationCardProps } from './types';
import ProgressBar from './ProgressBar'; // Tái sử dụng ProgressBar

const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
    const progress = (medication.taken / medication.total) * 100;
    return (
        <View style={styles.medCard}>
            <View style={styles.medInfo}>
                <View style={[styles.medIconContainer, { backgroundColor: medication.color }]}>
                    <View style={[styles.medIconPill, { backgroundColor: medication.iconColor }]} />
                </View>
                <View>
                    <Text style={styles.medName}>{medication.name}</Text>
                    <Text style={styles.medFrequency}>{medication.frequency}</Text>
                </View>
            </View>
            <ProgressBar progress={progress} color={medication.progressColor} />
        </View>
    );
};

const styles = StyleSheet.create({
    medCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#9FB1C6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, },
    medInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, },
    medIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12, transform: [{ rotate: '-45deg' }], },
    medIconPill: { width: 12, height: 24, borderRadius: 12, },
    medName: { fontSize: 16, fontWeight: '600', color: '#1E293B', },
    medFrequency: { fontSize: 14, color: '#64748B', marginTop: 2, },
});

export default MedicationCard;