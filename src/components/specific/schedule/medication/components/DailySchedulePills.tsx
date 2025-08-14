import { COLORS } from '@/constants/theme';
import { DoseStatus, GroupedDoseStatus } from '@/types';
import { Dose } from '@/types/dtos/dose/dose.dto';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';
import Ionicons from '@react-native-vector-icons/ionicons';
import dayjs from 'dayjs';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface MedicationPill {
    time: string;
    timeOfDay: GroupedDose['timeOfDay'];
    doseStatus: DoseStatus;
    groupStatus: GroupedDoseStatus;
    isCurrentPill: boolean;
}

interface DailySchedulePillsProps {
    currentDose: Dose;
    allDosesForDay: GroupedDose[];
    
    onPillPress: (time: string) => void;
}

const getPillInfo = (pill: MedicationPill) => {
    switch (pill.doseStatus) {
        case DoseStatus.TAKEN:
            return { icon: 'checkmark-circle', color: COLORS.success, style: styles.pillCompleted };
        case DoseStatus.SKIPPED:
        case DoseStatus.MISSED:
            return { icon: 'close-circle', color: COLORS.danger, style: styles.pillMissed };
        case DoseStatus.PENDING:
            if (pill.groupStatus === GroupedDoseStatus.ACTIVE) {
                return { icon: 'time', color: COLORS.primary, style: styles.pillActive };
            }
        // Fallthrough: Nếu không ACTIVE, nó vẫn là PENDING nhưng giao diện giống UPCOMING
        case DoseStatus.UPCOMING:
        default:
            return { icon: 'time-outline', color: COLORS.textLight, style: styles.pillUpcoming };
    }
};

const DailySchedulePills: React.FC<DailySchedulePillsProps> = ({ currentDose, allDosesForDay, onPillPress }) => {
    const medicationSchedule = useMemo((): MedicationPill[] => {
        const schedule: MedicationPill[] = [];

        for (const group of allDosesForDay) {
            const doseInGroup = group.doses.find(d => d.medication_name === currentDose.medication_name);

            if (doseInGroup) {
                schedule.push({
                    time: group.time,
                    timeOfDay: group.timeOfDay,
                    doseStatus: doseInGroup.status,
                    groupStatus: group.status,
                    isCurrentPill: doseInGroup.id === currentDose.id,
                });
            }
        }

        return schedule.sort((a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf());

    }, [allDosesForDay, currentDose.medication_name, currentDose.id]);

    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                // Phóng to lên 1.1 trong 1.5 giây
                withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                // Thu nhỏ về 1 trong 1.5 giây
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // -1 nghĩa là lặp vô tận
            true // true nghĩa là lặp ngược lại (yoyo effect)
        );
    }, []);

    const animatedCurrentPillStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });


    if (medicationSchedule.length <= 1) {
        return null;
    }

    return (
        <View style={styles.container}>
            {medicationSchedule.map((pill, index) => {
                const { icon, color, style } = getPillInfo(pill);

                return (
                    <AnimatedTouchableOpacity
                        key={pill.time}
                        style={[
                            styles.pill,
                            style,
                            index === 0 && styles.pillFirst,
                            pill.isCurrentPill && [styles.currentPill, animatedCurrentPillStyle]
                        ]}
                        onPress={() => onPillPress(pill.time)}
                    >
                        <View style={styles.pillHeader}>
                            <Ionicons name={icon as any} size={14} color={color} />
                            <Text style={[styles.pillText, { color }]}>{pill.timeOfDay}</Text>
                        </View>
                        <Text style={[styles.pillTime, { color }]}>{dayjs(pill.time).format('HH:mm')}</Text>
                    </AnimatedTouchableOpacity>
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
        marginTop: 10,
    },
    pill: {
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    currentPill: {
        transform: [{ scale: 1.10 }],
        paddingVertical: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 1 },
        shadowOpacity: 0.85,
        shadowRadius: 4,
    },
    pillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    pillFirst: {
        marginLeft: 4,
    },
    pillText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '700',
    },
    pillTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    pillUpcoming: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    pillActive: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    pillCompleted: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.success,
    },
    pillMissed: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.danger,
    },
});

export default DailySchedulePills;