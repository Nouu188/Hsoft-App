import { COLORS, FONTS, SHADOWS, SIZES } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StatCardProps } from '../types';
import { getHeartRateStatus } from './health_stat_card/getHeartRateStatus';
import HeartRateDisplay from './health_stat_card/HeartRateDisplay';
import HeartRateStatus from './health_stat_card/HeartRateStatus';

type Props = StatCardProps & {
  onDelete?: (key: string) => void;
};

const StatCard: React.FC<Props> = React.memo(
  ({ stat, healthProps, large = false, onDelete }) => {
    const [expanded, setExpanded] = useState(true);

    const progressValue = stat.progress ? stat.progress(healthProps) : 0;
    const displayValue = stat.getValue(healthProps);
    const heartStatus =
      stat.key === 'heart' ? getHeartRateStatus(healthProps.heartRate) : null;

    const toggleExpand = () => setExpanded(!expanded);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleExpand}
        style={[styles.card, large && styles.largeCard]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: stat.icon.bg }]}>
            <Ionicons name={stat.icon.name} size={18} color={stat.icon.color} />
          </View>
          <Text style={styles.cardTitle}>{stat.title}</Text>

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(stat.key)}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          {stat.key === 'heart' && heartStatus ? (
            expanded ? (
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
              <HeartRateDisplay
                value={displayValue}
                bpmColor={heartStatus.color}
                large={false}
              />
            )
          ) : (
            <Text style={styles.cardValue}>{displayValue}</Text>
          )}
        </View>

        {/* Progress bar (chỉ hiển thị khi stat có progress và đang expanded) */}
        {stat.progress && expanded && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progressValue * 100, 100)}%`,
                  backgroundColor: COLORS.primary,
                },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
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
    color: '#6F7D93',
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
    color: COLORS.text,
    lineHeight: 22,
  },
  heartBlock: {
    marginTop: SIZES.base,
    flexDirection: 'column',
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#EFF2F8',
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
