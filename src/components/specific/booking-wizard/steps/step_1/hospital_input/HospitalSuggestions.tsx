import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '@/constants/theme';
import type { Hospital } from '@/types/dtos/tenant/hospital.dto';

interface Props {
  suggestions: Hospital[];
  onSelect: (hospital: Hospital) => void;
}

const HospitalSuggestions: React.FC<Props> = ({ suggestions, onSelect }) => (
  <View style={styles.container}>
    {suggestions.map(hospital => (
      <TouchableOpacity
        key={hospital.externalCode}
        style={styles.button}
        onPress={() => onSelect(hospital)}
      >
        <Text style={styles.text}>{hospital.name}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { marginTop: SIZES.padding, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    backgroundColor: COLORS.white, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.light,
  },
  text: { ...FONTS.body4, color: COLORS.textDark },
});

export default HospitalSuggestions;
