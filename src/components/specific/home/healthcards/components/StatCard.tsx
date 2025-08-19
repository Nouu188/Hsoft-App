// src/screens/HealthStatsScreen/components/StatCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, FONTS, SHADOWS } from '@/constants/theme';
import { Stat, HealthStatsProps,StatCardProps } from '../types';


// --- Hàm logic cho Nhịp tim (không đổi) ---
const getHeartRateStatus = (rate: number): { text: string; color: string; advice: string | null } => {
    if (rate < 40) return { text: 'Rất chậm', color: COLORS.accent, advice: '⚠️ Nguy hiểm: Nhịp tim quá thấp, hãy gọi cấp cứu ngay lập tức.' };
    if (rate < 50) return { text: 'Chậm đáng kể', color: COLORS.warning, advice: 'Nếu có mệt, chóng mặt hoặc ngất, hãy đi khám ngay.' };
    if (rate < 60) return { text: 'Dưới mức bình thường', color: COLORS.warning, advice: 'Có thể bình thường với người tập thể thao. Nếu thấy khó chịu, hãy tham khảo ý kiến bác sĩ.' };
    if (rate <= 100) return { text: 'Sức khỏe tim mạch của bạn đang rất tốt', color: COLORS.success, advice: null }; // Lời khuyên là null khi sức khỏe tốt
    return { text: 'Nhanh', color: COLORS.accent, advice: 'Hãy nghỉ ngơi, uống nước, thử hít thở sâu. Nếu kéo dài, hãy đi khám.' };
};

// --- Component ---
const StatCard: React.FC<StatCardProps> = React.memo(({ stat, healthProps, large = false }) => {
  const progressValue = stat.progress ? stat.progress(healthProps) : 0;
  const displayValue = stat.getValue(healthProps);
  const heartStatus = stat.key === 'heart' ? getHeartRateStatus(healthProps.heartRate) : null;

  return (
    <View style={[styles.card, large && styles.largeCard]}>
      <View>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, { backgroundColor: stat.icon.bg }]}>
            <Ionicons name={stat.icon.name} size={18} color={stat.icon.color} />
          </View>
          <Text style={styles.cardTitle}>{stat.title}</Text>
        </View>

        <View style={styles.cardBody}>
          {stat.key === 'heart' && heartStatus ? (
            <View style={styles.heartRateContainer}>
              {/* THAY ĐỔI 1: Sửa lại toàn bộ cấu trúc phần này */}
              <View style={styles.heartRateDisplay}>
                <Text style={[styles.heartRateValue, large && styles.largeHeartRateValue]}>
                  {displayValue}
                </Text>

                {large && (
                  <View style={styles.pulseIconWrapper}>
                    <Ionicons name="pulse" size={40} color={heartStatus.color} />
                  </View>
                )}

                <Text style={styles.bpmText}>bpm</Text>
              </View>

              {/* Phần trạng thái VÀ lời khuyên */}
              <View>
                <Text style={[styles.statusText, { color: heartStatus.color }]}>
                  {heartStatus.text}
                </Text>
                {/* THAY ĐỔI 2: Thêm code để hiển thị advice */}
                {heartStatus.advice && (
                  <Text style={styles.adviceText}>{heartStatus.advice}</Text>
                )}
              </View>
            </View>
          ) : (
            <Text style={styles.cardValue}>{displayValue}</Text>
          )}
        </View>
      </View>

      {stat.progress && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progressValue * 100, 100)}%`, backgroundColor: COLORS.primary }]} />
        </View>
      )}
    </View>
  );
});

// --- Styles cho Component này ---
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
    largeCard: {},
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconWrapper: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    cardTitle: { ...FONTS.h3, marginLeft: SIZES.base, color: '#6F7D93' },
    cardBody: {
        marginTop: SIZES.base,
    },
    cardValue: { ...FONTS.h3, color: COLORS.text, lineHeight: 22 },

    heartRateContainer: {
        height: '85%',
        justifyContent: 'space-between', // Đẩy phần số và phần text ra xa nhau
    },
    heartRateDisplay: {
      flexDirection: 'row',
      alignItems: 'baseline', // Căn chỉnh cho số và chữ 'bpm' thẳng hàng
    },
    heartRateValue: {
        ...FONTS.h1,
        fontSize: 36,
        color: COLORS.textDark,
    },
    largeHeartRateValue: {
      fontSize: 48, // Tăng font size cho ấn tượng
      fontWeight: 'bold',
      color: '#3A5C94',
    },
    bpmText: {
        ...FONTS.h3,
        color: COLORS.textLight,
        fontWeight: '600'
    },
    pulseIconWrapper: {
      marginHorizontal: SIZES.base,
      paddingBottom: SIZES.base, // Giúp icon căn thẳng hàng hơn với đường baseline
    },
    statusText: {
        ...FONTS.body3,
        fontWeight: '600',
    },
    // THAY ĐỔI 3: Thêm style cho lời khuyên
    adviceText: {
        ...FONTS.body4,
        color: COLORS.text,
        marginTop: SIZES.base / 2,
    },
    progressBar: {
        height: 6, backgroundColor: '#EFF2F8', borderRadius: 3,
        overflow: 'hidden', marginTop: SIZES.base,
    },
    progressFill: { height: '100%', borderRadius: 3 },
});

export default StatCard;