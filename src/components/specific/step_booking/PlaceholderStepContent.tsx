// src/components/specific/step_booking/PlaceholderStepContent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface PlaceholderStepProps {
  title: string;
}

const PlaceholderStepContent: React.FC<PlaceholderStepProps> = ({ title }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>
        This is a placeholder for the "{title}" step content.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
    section: { marginBottom: SIZES.padding * 1.5 },
    title: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.base },
    description: { fontSize: SIZES.body3, color: COLORS.secondary, lineHeight: 22 },
});

export default PlaceholderStepContent;