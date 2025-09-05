import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import type { Ringtone } from '@/navigation/types';

interface Props {
  ringtone: Ringtone;
  selected: boolean;
  playing: boolean;
  onApply: (r: Ringtone) => void;
  onPlay: (r: Ringtone) => void;
  onDelete?: (r: Ringtone) => void;
}

const RingtoneItem: React.FC<Props> = ({ ringtone, selected, playing, onApply, onPlay, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const threshold = -180;

  const deleteOpacity = translateX.interpolate({
    inputRange: [-120, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) translateX.setValue(Math.max(gesture.dx, -120));
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < threshold) Animated.spring(translateX, { toValue: -100, useNativeDriver: true }).start();
        else Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <View style={{ marginBottom: 1 }}>
      {onDelete && (
        <Animated.View style={[styles.deleteContainer, { opacity: deleteOpacity }]}>
          <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(ringtone)}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Xóa</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View
        {...(onDelete ? panResponder.panHandlers : {})}
        style={[styles.item, selected && styles.selected, { transform: [{ translateX }] }]}
      >
        <TouchableOpacity style={{ flex: 1, marginRight: 10 }} onPress={() => onPlay(ringtone)}>
          <Text style={styles.name}>{ringtone.name}</Text>
          <Text style={styles.duration}>{ringtone.duration}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={() => onApply(ringtone)}>
          <Text style={styles.applyText}>Áp dụng</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base * 1.2, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, backgroundColor: COLORS.transparent },
  selected: { backgroundColor: COLORS.lightBlue + '20' },
  name: { ...FONTS.body3, color: COLORS.textDark },
  duration: { ...FONTS.body4, color: COLORS.textLight, marginTop: 2 },
  applyButton: { backgroundColor: COLORS.border, paddingVertical: SIZES.base * 0.8, paddingHorizontal: SIZES.padding, borderRadius: SIZES.radius * 4 },
  applyText: { ...FONTS.body4, color: COLORS.textDark, fontWeight: 'bold' },
  deleteContainer: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 180, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: SIZES.padding },
  deleteButton: { backgroundColor: COLORS.danger, paddingVertical: SIZES.base * 1, paddingHorizontal: SIZES.padding * 1.72, borderRadius: SIZES.radius * 4 },
});

export default RingtoneItem;
