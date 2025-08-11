import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import dayjs from 'dayjs';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';
import DoseItem from './DoseItem';
import { MealRelation } from '@/types/dtos/dose/dose.dto';

interface TimeSlotCardProps {
    group: GroupedDose;
    allDosesForDay: GroupedDose[];
    onMarkAllAsTaken: (time: string) => void;
    onTogglePrepared: (doseId: string) => void;
    onNavigateToTime: (time: string) => void;
    onSkipDose: (doseId: string) => void;
    onRescheduleDose: (doseId: string, newTime: string) => void;
    onSetMealPreference: (doseId: string, preference: MealRelation | null) => void;
}

const getStatusInfo = (status: GroupedDose['status']) => {
    switch (status) {
        case 'ACTIVE':
            return { cardStyle: styles.cardActive, iconColor: COLORS.primary, tagText: 'Đến giờ uống' };
        case 'COMPLETED':
            return { cardStyle: styles.cardCompleted, iconColor: COLORS.success, tagText: 'Đã uống' };
        case 'MISSED':
            return { cardStyle: styles.cardMissed, iconColor: COLORS.danger, tagText: 'Đã bỏ lỡ' };
        case 'UPCOMING':
        default:
            return { cardStyle: {}, iconColor: COLORS.textLight, tagText: 'Sắp tới' };
    }
};

const TimeSlotCard: React.FC<TimeSlotCardProps> = (props) => {
    const { group, allDosesForDay, onMarkAllAsTaken, onTogglePrepared, onNavigateToTime, onSkipDose, onRescheduleDose, onSetMealPreference } = props; const { cardStyle, iconColor, tagText } = getStatusInfo(group.status);
    const isActionable = group.status === 'ACTIVE' || group.status === 'MISSED';

    const allDosesPrepared = group.doses.every(d => d.is_prepared);

    return (
        <Shadow distance={8} startColor={'#1B4D7E0F'} offset={[2, 5]} style={styles.shadowContainer}>
            <View style={[styles.card, cardStyle]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Ionicons name="alarm-outline" size={24} color={iconColor} />
                        <Text style={styles.timeText}>{group.timeOfDay} - {dayjs(group.time).format('HH:mm')}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: iconColor }]}>
                        <Text style={styles.tagText}>{tagText}</Text>
                    </View>
                </View>

                {isActionable && (
                    <View style={[styles.preparedStatus, allDosesPrepared && styles.preparedStatusDone]}>
                        <Ionicons name={allDosesPrepared ? "checkmark-circle" : "information-circle-outline"} size={18} color={allDosesPrepared ? COLORS.success : COLORS.textLight} />
                        <Text style={[styles.preparedStatusText, allDosesPrepared && styles.preparedStatusTextDone]}>
                            {allDosesPrepared ? 'Đã chuẩn bị đủ thuốc' : 'Đánh dấu vào ô vuông khi lấy thuốc'}
                        </Text>
                    </View>
                )}

                <View style={styles.doseList}>
                    {group.doses.map(dose => (
                        <DoseItem
                            key={dose.id}
                            time={group.time}
                            dose={dose}
                            allDosesForDay={allDosesForDay}
                            onTogglePrepared={onTogglePrepared}
                            onNavigateToTime={onNavigateToTime}
                            onSkipDose={onSkipDose}
                            onSetMealPreference={onSetMealPreference}
                        />
                    ))}
                </View>

                {isActionable && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onMarkAllAsTaken(group.time)}
                    >
                        <Ionicons name="checkmark-done-outline" size={22} color={COLORS.white} />
                        <Text style={styles.actionButtonText}>Đánh dấu tất cả đã uống</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Shadow>
    );
};

const styles = StyleSheet.create({
    shadowContainer: { width: '100%', marginBottom: SIZES.padding },
    card: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 1.5,
        padding: SIZES.padding * 0.8,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    cardActive: { borderColor: COLORS.primary },
    cardCompleted: { borderColor: COLORS.success, backgroundColor: '#E9F9EF', paddingBottom: 2 },
    cardMissed: { borderColor: COLORS.danger, backgroundColor: '#fdededf9' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: SIZES.padding / 2 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    timeText: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: COLORS.textDark },
    tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: SIZES.radius },
    tagText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
    doseList: { paddingTop: SIZES.padding * 0.35, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SIZES.padding / 2 },
    doseItem: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: SIZES.padding / 2 },
    doseIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    medicationName: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
    dosageText: { fontSize: 14, color: COLORS.textLight },
    actionButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: SIZES.radius },
    actionButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    preparedStatus: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, padding: 8, borderRadius: SIZES.radius, marginTop: SIZES.padding / 4, shadowColor: '#000',
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 1
    },
    preparedStatusDone: { backgroundColor: '#E9F9EF' },
    preparedStatusText: { marginLeft: 8, color: COLORS.textLight, fontStyle: 'italic' },
    preparedStatusTextDone: { color: COLORS.success, fontWeight: '600' },
    doseItemContainer: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, marginBottom: SIZES.padding / 2, overflow: 'hidden' },
    preparedItem: { opacity: 0.8 },
    checkbox: { paddingRight: 10 },
    doseInfo: { flex: 1 },
    expandButton: { padding: 5 },
    nextDosesContainer: { paddingLeft: 46, paddingRight: 10, paddingBottom: 12, paddingTop: 4 },
    nextDosesTitle: { fontWeight: '600', color: COLORS.textDark, marginBottom: 4 },
    nextDoseText: { color: COLORS.textLight, lineHeight: 20 },
});

export default TimeSlotCard;