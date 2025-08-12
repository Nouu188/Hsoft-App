import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { DoseStatus, MealRelation } from '@/types';

interface MealTimeSetterProps {
  mealRelation?: MealRelation | null;
  doseStatus: DoseStatus;
  onPress: () => void;
}

const MealTimeSetter: React.FC<MealTimeSetterProps> = ({ mealRelation, doseStatus, onPress }) => {
  const isActionLocked = doseStatus === DoseStatus.TAKEN || doseStatus === DoseStatus.SKIPPED;
  
  const hasValue = mealRelation && (mealRelation.minutes !== undefined || mealRelation.type === 'WITH');

  const getDisplayText = () => {
    if (!mealRelation) {
      return '-- phút';
    }
    switch (mealRelation.type) {
      case 'BEFORE':
      case 'AFTER':
        return mealRelation.minutes ? `${mealRelation.minutes} phút` : '-- phút';
      case 'WITH':
        return 'Trong bữa ăn';
      default:
        return '-- phút';
    }
  };

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    isActionLocked && styles.disabledContainer,
  ];

  const textStyle: StyleProp<TextStyle> = [
    styles.text,
    hasValue && !isActionLocked && styles.textWithValue,
    isActionLocked && styles.disabledText,
  ];

  const iconColor = hasValue && !isActionLocked ? COLORS.primary : COLORS.textLight;

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} disabled={isActionLocked}>
      <Ionicons 
        name={mealRelation?.type === 'WITH' ? "restaurant-outline" : "alarm-outline"} 
        size={16} 
        color={isActionLocked ? COLORS.primary : iconColor} 
      />
      <Text style={textStyle}>
        {getDisplayText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: SIZES.radius,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  disabledContainer: {
    backgroundColor: '#F1F5F9', 
  },
  text: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.textLight,
  },
  textWithValue: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  disabledText: {
    color: COLORS.primary,
  },
});

export default MealTimeSetter;