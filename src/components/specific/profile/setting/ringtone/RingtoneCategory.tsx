import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RingtoneItem from './RingtoneItem';
import type { Ringtone } from '@/navigation/types';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

interface Props {
  title: string;
  ringtones: Ringtone[];
  selectedRingtoneId: string | null;
  playingRingtoneId: string | null;
  onApply: (r: Ringtone) => void;
  onPlay: (r: Ringtone) => void;
  onDelete?: (r: Ringtone) => void;
}

const RingtoneCategory: React.FC<Props> = ({ title, ringtones, selectedRingtoneId, playingRingtoneId, onApply, onPlay, onDelete }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {ringtones.map((r) => (
      <RingtoneItem
        key={r.id}
        ringtone={r}
        selected={r.id === selectedRingtoneId}
        playing={r.id === playingRingtoneId}
        onApply={onApply}
        onPlay={onPlay}
        onDelete={onDelete}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { marginTop: SIZES.padding, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.primaryLight, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight },
  title: { ...FONTS.body4, color: COLORS.textLight, paddingHorizontal: SIZES.padding, paddingTop: SIZES.padding, paddingBottom: SIZES.base },
});

export default RingtoneCategory;
