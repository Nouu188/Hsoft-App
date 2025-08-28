import { FONTS, SIZES, COLORS } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;
  advice: string | null;
  color: string;
  large?: boolean;
};

const HeartRateStatus: React.FC<Props> = ({ text, advice, color, large = false }) => {
  return (
    // THAY ĐỔI 1: Thêm View container để nhóm text lại
    <View style={styles.container}> 
      <Text style={[styles.status, { color }]}>{text}</Text>
      {large && advice && (
        <Text style={styles.advice}>{advice}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Không cần style ở đây, chỉ dùng để nhóm
  },
  status: { 
    ...FONTS.h4, // Tăng nhẹ font size cho dễ đọc
    fontWeight: 'bold', // In đậm để nhấn mạnh
  },
  advice: { 
    ...FONTS.body4, 
    color: COLORS.text,
    marginTop: SIZES.base / 2, // Thêm khoảng cách với status
    lineHeight: 18, // Cải thiện khả năng đọc cho đoạn text dài
  },
});

export default HeartRateStatus;