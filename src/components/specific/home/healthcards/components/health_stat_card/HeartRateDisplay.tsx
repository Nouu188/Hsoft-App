import { COLORS, FONTS, SIZES } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  value: number | string;
  bpmColor: string;
  large?: boolean;
};

const HeartRateDisplay: React.FC<Props> = ({ value, bpmColor, large = false }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.value, large ? styles.largeValue : styles.smallValue]}>
        {value}
      </Text>

      {large && (
        <View style={styles.iconWrapper}>
          <Ionicons name="pulse" size={40} color={bpmColor} />
        </View>
      )}

      <Text style={[styles.bpm, large ? styles.largeBpm : styles.smallBpm]}>bpm</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'baseline' },
  value: { fontWeight: '700' },
  smallValue: { fontSize: SIZES.h2, color: COLORS.textDark },
  largeValue: { fontSize: 36, color: COLORS.textDark },
  bpm: { ...FONTS.h3, fontWeight: '600' },
  smallBpm: { fontSize: 12, color: COLORS.textLight, marginLeft: 2 },
  largeBpm: { fontSize: 18, color: COLORS.textDark, marginLeft: 4 },
  iconWrapper: { marginHorizontal: SIZES.base, paddingBottom: SIZES.base },
});

export default HeartRateDisplay;
