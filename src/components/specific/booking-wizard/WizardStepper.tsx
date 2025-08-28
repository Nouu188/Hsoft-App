import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface StepProps {
  index: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}

interface WizardStepperProps {
    steps: string[],
    currentStep: number,
}

const Step: React.FC<StepProps> = ({ index, label, isActive, isCompleted, isLast }) => (
  <React.Fragment>
    <View style={styles.stepContainer}>
      <View style={[styles.circle, (isActive || isCompleted) && styles.circleActive]}>
        <Text style={[styles.stepNumber, (isActive || isCompleted) && styles.stepNumberActive]}>
          {isCompleted ? '✓' : index + 1}
        </Text>
      </View>
      <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
    </View>
    {!isLast && <View style={[styles.line, isCompleted && styles.lineActive]} />}
  </React.Fragment>
);

const WizardStepper: React.FC<WizardStepperProps> = ({ steps = [], currentStep = 0 }) => (
  <View style={styles.container}>
    {steps.map((step, index) => (
      <Step
        key={index}
        index={index}
        label={step}
        isActive={index === currentStep}
        isCompleted={index < currentStep}
        isLast={index === steps.length - 1}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between',
  },
  stepContainer: { alignItems: 'center' },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  circleActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  stepNumber: { color: COLORS.textLight, fontWeight: 'bold' },
  stepNumberActive: { color: COLORS.primary },
  stepLabel: { marginTop: 8, color: COLORS.textLight, fontSize: 12 },
  stepLabelActive: { color: COLORS.primary, fontWeight: 'bold' },
  line: { flex: 1, height: 2, backgroundColor: COLORS.border },
  lineActive: { backgroundColor: COLORS.primary },
});

export default WizardStepper;
