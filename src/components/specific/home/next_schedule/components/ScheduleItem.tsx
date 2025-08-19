import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { NextScheduleItemProps } from '../types';

const NextScheduleItem: React.FC<NextScheduleItemProps> = ({
  iconName,
  iconBgColor,
  title,
  subtitle,
  onPress,
}) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={24} color={COLORS.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitleText} numberOfLines={1}>{subtitle}</Text>
        </View>
        
        <Ionicons name="chevron-forward-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.8,
    ...SHADOWS.medium,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding * 0.8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
});

export default NextScheduleItem;