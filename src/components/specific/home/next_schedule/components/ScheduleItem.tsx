import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SIZES, SHADOWS, COLORS } from '@/constants/theme';
import { NextScheduleItemProps } from '../types';
import { useThemeStore } from '@/store/useThemeStore';

const NextScheduleItem: React.FC<NextScheduleItemProps> = ({
  iconName,
  iconBgColor,
  title,
  subtitle,
  onPress,
}) => {
  const { theme, isDarkMode } = useThemeStore();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? theme.lightBlack : theme.white, 
            shadowColor: isDarkMode ? COLORS.border : theme.placeholderColor, 
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor:isDarkMode ? theme.secondary : theme.lightGray },
          ]}
        >
          <Ionicons
            name={iconName}
            size={24}
            color={iconBgColor ? theme.primary : theme.textOnPrimary}
          />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.titleText,
              { color: isDarkMode ? COLORS.white : theme.textDark }, // 🔥 đổi text khi dark
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.subtitleText,
              { color: isDarkMode ? COLORS.introduction : theme.textLight }, // 🔥 subtitle đổi theo mode
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color={isDarkMode ? COLORS.white : theme.secondary} // 🔥 đổi màu icon theo mode
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding / 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
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
  },
  subtitleText: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default NextScheduleItem;
