import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface DoctorTagProps {
  name: string;
  time?: string;
  width: number;
}

const DoctorTag: React.FC<DoctorTagProps> = ({ name, time, width }) => (
  <View style={[styles.tag, { width }]}>
    <Text style={styles.tagText} numberOfLines={1}>
      {name}
      {time ? ` (${time})` : ''}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tag: {
    backgroundColor: COLORS.lightBlue,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default DoctorTag;