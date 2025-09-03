import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, FONTS, SHADOWS, SIZES } from '@/constants/theme';
import { getHeartRateStatus } from './health_stat_card/getHeartRateStatus';
import HeartRateDisplay from './health_stat_card/HeartRateDisplay';
import HeartRateStatus from './health_stat_card/HeartRateStatus';
import { StatCardComponentProps } from '../types';

/**
 * StatCard
 * 
 * Component hiển thị 1 "thẻ thống kê sức khoẻ".
 * Có thể mở rộng/thu gọn nội dung khi bấm vào.
 * 
 * Props (StatCardComponentProps):
 * - stat: Stat → thông tin của chỉ số sức khoẻ (icon, title, getValue, progress).
 * - healthProps: HealthStatsProps → dữ liệu sức khoẻ hiện tại.
 * - large?: boolean → có hiển thị card ở dạng lớn không.
 * - onDelete?: (key: string) => void → callback khi bấm nút xoá (nếu có).
 */
const StatCard: React.FC<StatCardComponentProps> = React.memo(
  ({ stat, healthProps, large = false, onDelete }) => {
    const progressValue = stat.progress ? stat.progress(healthProps) : 0;
    const displayValue = stat.getValue(healthProps);

    const heartStatus =
      stat.key === 'heart' ? getHeartRateStatus(healthProps.heartRate) : null;

    // Luôn hiển thị expanded
    const expanded = true;

    return (
      <View style={[styles.card, large && styles.largeCard]}>
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
            <Text style={styles.cardValue}>{displayValue}</Text>
          )}
        </View>

        {stat.progress && (
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
      </View>
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
    width: '95%', // card lớn rộng hơn 1 chút
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
