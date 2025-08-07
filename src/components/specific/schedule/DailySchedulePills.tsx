import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';
import dayjs from 'dayjs';

interface DailySchedulePillsProps {
    medicationName: string;
    allDosesForDay: GroupedDose[];
}

const DailySchedulePills: React.FC<DailySchedulePillsProps> = ({ medicationName, allDosesForDay }) => {
    const medicationSchedule = useMemo(() => {
        return allDosesForDay
            .filter(group => group.doses.some(d => d.medication_name === medicationName))
            .sort((a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf());
    }, [allDosesForDay, medicationName]);

    if (medicationSchedule.length <= 1) {
        return null; 
    }

    const getPillInfo = (status: GroupedDose['status']) => {
        switch (status) {
            case 'COMPLETED':
                return { icon: 'checkmark-circle', color: COLORS.success, style: styles.pillCompleted };
            case 'MISSED':
                return { icon: 'close-circle', color: COLORS.danger, style: styles.pillMissed };
            case 'ACTIVE':
                return { icon: 'time', color: COLORS.primary, style: styles.pillActive };
            case 'UPCOMING':
            default:
                return { icon: 'time-outline', color: COLORS.textLight, style: styles.pillUpcoming };
        }
    };

    return (
        <View style={styles.container}>
            {medicationSchedule.map(group => {
                const { icon, color, style } = getPillInfo(group.status);
                return (
                    <View key={group.time} style={[styles.pill, style]}>
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name={icon as any} size={14} color={color} />
                            <Text style={[styles.pillText, { color }]}>{group.timeOfDay}</Text>
                        </View>
                        <Text style={styles.pillText}>{dayjs(group.time).format('HH:mm')}</Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    pill: {
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    pillText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
    },
    pillUpcoming: {
        backgroundColor: '#F0F0F0',
        borderColor: '#E0E0E0',
    },
    pillActive: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    pillCompleted: {
        backgroundColor: '#E9F9EF',
        borderColor: COLORS.success,
    },
    pillMissed: {
        backgroundColor: '#FDEDED',
        borderColor: COLORS.danger,
    },
});

export default DailySchedulePills;