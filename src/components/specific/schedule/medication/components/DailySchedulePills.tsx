import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import dayjs from 'dayjs';
import { GroupedDose } from '@/types/dtos/dose/grouped-dose.dto';
import { Dose } from '@/types/dtos/dose/dose.dto';

interface MedicationPill {
  time: string;
  timeOfDay: GroupedDose['timeOfDay'];
  doseStatus: 'UPCOMING' | 'TAKEN' | 'SKIPPED';
  isCurrentPill: boolean;
}

interface DailySchedulePillsProps {
  currentDose: Dose; 
  allDosesForDay: GroupedDose[];
  onPillPress: (time: string) => void;
}

const getPillInfo = (doseStatus: 'UPCOMING' | 'TAKEN' | 'SKIPPED', groupStatus: GroupedDose['status']) => {
  switch (doseStatus) {
    case 'TAKEN':
      return { icon: 'checkmark-circle', color: COLORS.success, style: styles.pillCompleted };
    case 'SKIPPED':
      return { icon: 'close-circle', color: COLORS.danger, style: styles.pillMissed };
    case 'UPCOMING':
    default:
      // Nếu liều thuốc đang PENDING, chúng ta sẽ dựa vào trạng thái của cả nhóm
      // để biết nó là ACTIVE hay UPCOMING
      if (groupStatus === 'ACTIVE') {
        return { icon: 'time', color: COLORS.primary, style: styles.pillActive };
      }
      return { icon: 'time-outline', color: COLORS.textLight, style: styles.pillUpcoming };
  }
};

const DailySchedulePills: React.FC<DailySchedulePillsProps> = ({ currentDose, allDosesForDay, onPillPress }) => {
  
  const medicationSchedule = useMemo((): MedicationPill[] => {
    const schedule: MedicationPill[] = [];

    // Lặp qua tất cả các cữ thuốc trong ngày
    for (const group of allDosesForDay) {
      const doseInGroup = group.doses.find(d => d.medication_name === currentDose.medication_name);

      if (doseInGroup) {
        schedule.push({
          time: group.time,
          timeOfDay: group.timeOfDay,
          doseStatus: doseInGroup.status,
          isCurrentPill: doseInGroup.id === currentDose.id,
        });
      }
    }
    
    // Sắp xếp lại một lần nữa để đảm bảo thứ tự đúng
    return schedule.sort((a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf());

  }, [allDosesForDay, currentDose.medication_name, currentDose.id]);

  // Không hiển thị nếu thuốc này chỉ có 1 liều trong ngày
  if (medicationSchedule.length <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      {medicationSchedule.map((pill, index) => {
        const group = allDosesForDay.find(g => g.time === pill.time);
        if (!group) return null;

        const { icon, color, style } = getPillInfo(pill.doseStatus, group.status);
        
        return (
          <TouchableOpacity 
            key={pill.time} 
            style={[
              styles.pill, 
              style, 
              pill.doseStatus === 'TAKEN' && index === 0 && { marginLeft: 4 },
              pill.isCurrentPill && styles.currentPill
            ]} 
            onPress={() => onPillPress(pill.time)}
          >
            <View style={styles.pillHeader}>
              <Ionicons name={icon as any} size={14} color={color} />
              <Text style={[styles.pillText, { color }]}>{pill.timeOfDay}</Text>
            </View>
            <Text style={[styles.pillTime, { color }]}>{dayjs(pill.time).format('HH:mm')}</Text>
          </TouchableOpacity>
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
    transform: [{ scale: 1.08 }],
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
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