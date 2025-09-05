import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import type { Ringtone } from '@/navigation/types';

interface Props {
  title: string;
  ringtone?: Ringtone;
  onApply?: (r?: Ringtone) => void;
  onPlay?: (r: Ringtone) => void;
}

const DefaultOption: React.FC<Props> = ({ title, ringtone, onApply, onPlay }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => ringtone && onPlay?.(ringtone)}>
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.applyButton} onPress={() => onApply?.(ringtone)}>
        <Text style={styles.applyText}>Áp dụng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.padding * 0.9, backgroundColor: COLORS.transparent, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight },
  text: { ...FONTS.body3, color: COLORS.textDark },
  applyButton: { backgroundColor: COLORS.border, paddingVertical: SIZES.base * 0.8, paddingHorizontal: SIZES.padding, borderRadius: SIZES.radius * 4 },
  applyText: { ...FONTS.body4, color: COLORS.textDark, fontWeight: 'bold' },
});

export default DefaultOption;
