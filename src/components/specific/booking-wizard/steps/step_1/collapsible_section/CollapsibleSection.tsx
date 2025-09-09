import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import { useHospitalUIStore } from '@/store/useHospitalUIStore';
import SectionHeader from './SectionHeader';
import AnimatedContent from './AnimatedContent';

interface CollapsibleSectionProps {
  title: string;
  subTitle?: React.ReactNode;
  children: React.ReactNode;
  sectionKey: 'hospital' | 'bookingType';
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subTitle,
  children,
  sectionKey,
}) => {
  const expanded = useHospitalUIStore(
    (state) => state.sectionExpanded[sectionKey] || false,
  );
  const setSectionExpanded = useHospitalUIStore(
    (state) => state.setSectionExpanded,
  );
  const hospitalSelected = useHospitalUIStore((state) => state.hospitalSelected);

  const disabled = sectionKey === 'bookingType' && !hospitalSelected;

  const toggleExpanded = () => {
    if (!disabled) setSectionExpanded(sectionKey, !expanded);
  };

  return (
    <View style={[styles.sectionContainer, disabled && styles.sectionDisabled]}>
      <SectionHeader
        title={title}
        subTitle={subTitle}
        expanded={expanded}
        disabled={disabled}
        onPress={toggleExpanded}
      />
      <AnimatedContent expanded={expanded}>{children}</AnimatedContent>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: SIZES.padding * 1.5,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
  },
  sectionDisabled: {
    opacity: 0.9,
  },
});

export default CollapsibleSection;
