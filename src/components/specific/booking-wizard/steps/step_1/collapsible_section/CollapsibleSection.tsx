// File tổng của CollapsibleSection
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import { useBookingStore } from '@/store/useBookingStore';
import SectionHeader from './SectionHeader';
import AnimatedContent from './AnimatedContent';

interface CollapsibleSectionProps {
  title: string;
  subTitle?: React.ReactNode;
  children: React.ReactNode;
  sectionKey: 'hospital' | 'bookingType' | 'patientInfo' | 'hospitalInfo' | 'doctorInfo';
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subTitle,
  children,
  sectionKey,
}) => {
  // lấy trực tiếp từ store (đã gộp UI vào data)
  const expanded = useBookingStore(
    (state) => state.ui.sectionExpanded[sectionKey] || false
  );
  const setSectionExpanded = useBookingStore((state) => state.setSectionExpanded);
  const hospitalSelected = useBookingStore((state) => state.ui.hospitalSelected);

  const disabled = sectionKey === 'bookingType' && !hospitalSelected;

  const toggleExpanded = () => {
    if (!disabled) {
      setSectionExpanded(sectionKey, !expanded);
    }
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
  },
  sectionDisabled: {
    opacity: 0.6, 
  },
});

export default CollapsibleSection;
