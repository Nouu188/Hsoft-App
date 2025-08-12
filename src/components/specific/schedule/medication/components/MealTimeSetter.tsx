import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { MealRelation } from '@/types/dtos/dose/dose.dto';

interface MealTimeSetterProps {
  mealRelation?: MealRelation | null;
  doseStatus: 'UPCOMING' | 'TAKEN' | 'SKIPPED',
  onPress: () => void;
}

const MealTimeSetter: React.FC<MealTimeSetterProps> = ({ mealRelation, doseStatus, onPress }) => {
  const hasValue = mealRelation && mealRelation.minutes;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={doseStatus === 'TAKEN' || doseStatus === 'SKIPPED'}>
      <Ionicons name="alarm-outline" size={16} color={hasValue ? COLORS.primary : COLORS.textLight} />
      <Text style={[styles.text, hasValue && styles.textWithValue as any]}>
        {hasValue ? `${mealRelation.minutes} phút` : '-- phút'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1
  },
  text: {
    marginLeft: 5,
    fontSize: 13,
    color: COLORS.textLight,
  },
  textWithValue: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default MealTimeSetter;