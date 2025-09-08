import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { FONTS, SHADOWS, SIZES } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import { COLORS } from '@/constants/theme';
import { DARK_COLORS } from '@/constants/theme';
import { getHeartRateStatus } from './health_stat_card/getHeartRateStatus';
import HeartRateDisplay from './health_stat_card/HeartRateDisplay';
import HeartRateStatus from './health_stat_card/HeartRateStatus';
import { StatCardComponentProps } from '../types';

const StatCard: React.FC<StatCardComponentProps> = React.memo(
  ({ stat, healthProps, large = false, onDelete }) => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? DARK_COLORS : COLORS;

    const progressValue = stat.progress ? stat.progress(healthProps) : 0;
    const displayValue = stat.getValue(healthProps);

    const heartStatus =
      stat.key === 'heart' ? getHeartRateStatus(healthProps.heartRate) : null;

    const expanded = true;

    return (
      <View
        style={[
          styles.card,
          large && styles.largeCard,
          { backgroundColor: theme.white, shadowColor: theme.textDark },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons name={stat.icon.name} size={18} color={theme.textDark} />
          </View>

          <Text style={[styles.cardTitle, { color: theme.textLight }]}>
            {stat.title}
          </Text>

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(stat.key)}
            >
              <Ionicons name="close-circle" size={20} color={theme.accent} />
            </TouchableOpacity>
          )}
        </View>


        <View style={styles.cardBody}>
          {stat.key === 'heart' && heartStatus ? (
            <View style={styles.heartBlock}>
              <HeartRateDisplay
                value={displayValue}
                bpmColor={heartStatus.color}
                large={large}
              />
              <HeartRateStatus
                text={heartStatus.text}
                advice={heartStatus.advice}
                color={heartStatus.color}
                large={large}
              />
            </View>
          ) : (
            <Text style={[styles.cardValue, { color: theme.text }]}>
              {displayValue}
            </Text>
          )}
        </View>

        {stat.progress && (
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progressValue * 100, 100)}%`,
                  backgroundColor: theme.lightBlue,
                },
              ]}
            />
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radius * 2,
    padding: SIZES.base * 2,
    ...SHADOWS.medium,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  largeCard: {
    width: '95%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...FONTS.h3,
    marginLeft: SIZES.base,
    flex: 1,
  },
  deleteBtn: {
    marginLeft: 8,
  },
  cardBody: {
    marginTop: SIZES.base,
  },
  cardValue: {
    ...FONTS.h3,
    lineHeight: 22,
  },
  heartBlock: {
    marginTop: SIZES.base,
    flexDirection: 'column',
    gap: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: SIZES.base,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default StatCard;
