// src/components/specific/step_booking/AdditionalStepContent.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';
import FileAttachment from './FileAttachment';

interface AdditionalStepProps {
  coverLetter: string;
  setCoverLetter: (text: string) => void;
  resume: { name: string; size: string } | null;
  onDeleteResume: () => void;
}

const AdditionalStepContent: React.FC<AdditionalStepProps> = ({
  coverLetter,
  setCoverLetter,
  resume,
  onDeleteResume,
}) => {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.title}>Additional information</Text>
        <Text style={styles.description}>
          In order to match you with the right opportunities we need some
          additional information first.
        </Text>
        <Text style={styles.requiredFields}>*Required fields</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Cover letter*</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={coverLetter}
          onChangeText={setCoverLetter}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Resume</Text>
        {resume && (
          <FileAttachment
            fileName={resume.name}
            fileSize={resume.size}
            onDelete={onDeleteResume}
          />
        )}
      </View>
    </>
  );
};

// ... copy styles liên quan từ file BookingScreen.tsx vào đây ...
const styles = StyleSheet.create({
    section: { marginBottom: SIZES.padding * 1.5 },
    title: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.base },
    description: { fontSize: SIZES.body3, color: COLORS.secondary, lineHeight: 22 },
    requiredFields: { fontSize: SIZES.body4, color: 'red', marginTop: SIZES.base },
    label: { fontSize: SIZES.h4, fontWeight: '500', color: COLORS.text, marginBottom: SIZES.base },
    textInput: { minHeight: 200, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, padding: SIZES.padding, fontSize: SIZES.body3, color: COLORS.text, textAlignVertical: 'top' },
});

export default AdditionalStepContent;