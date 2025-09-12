import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';
import { Doctor } from '@/components/specific/schedule/appointment/components/doctor_list/DoctorCard';
import DoctorTagList from './DoctorTagList';
import ExpandHandle from './ExpandHandle';

interface SelectedFooterProps {
  selectedDoctors: Doctor[];
  doctorTimes: Record<string, string | undefined>;
  onNext: () => void;
}

const screenWidth = Dimensions.get('window').width;
const PADDING_HORIZONTAL = SIZES.padding * 2;
const TAG_MARGIN = 6;
const TAG_HEIGHT = 30;
const TAG_WIDTH = (screenWidth - PADDING_HORIZONTAL - TAG_MARGIN) / 2;
const HANDLE_HEIGHT = 16;
const FOOTER_PADDING_BOTTOM = SIZES.padding;
const ZERO_DOCTOR_HEIGHT = HANDLE_HEIGHT + FOOTER_PADDING_BOTTOM;

const SelectedFooter: React.FC<SelectedFooterProps> = ({ selectedDoctors, doctorTimes, onNext }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateHeight = (expanded: boolean) => {
    const numDoctors = selectedDoctors.length;
    if (numDoctors === 0) return ZERO_DOCTOR_HEIGHT;
    const rows = expanded ? Math.ceil(numDoctors / 2) : 1;
    return rows * (TAG_HEIGHT + TAG_MARGIN) + HANDLE_HEIGHT + SIZES.base * 2;
  };

  const animatedHeight = useRef(new Animated.Value(calculateHeight(false))).current;

  const animateHeight = (targetHeight: number) => {
    Animated.timing(animatedHeight, { toValue: targetHeight, duration: 200, useNativeDriver: false }).start();
  };

  const toggleExpand = () => {
    if (selectedDoctors.length === 0) return;
    animatedHeight.stopAnimation(currentHeight => {
      const expandedHeight = calculateHeight(true);
      const collapsedHeight = calculateHeight(false);
      const halfway = (expandedHeight + collapsedHeight) / 2;
      const expand = currentHeight <= halfway;
      setIsExpanded(expand);
      animateHeight(expand ? expandedHeight : collapsedHeight);
    });
  };

  const panY = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        selectedDoctors.length > 0 && Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        animatedHeight.stopAnimation(value => (panY.current = value));
      },
      onPanResponderMove: (_, gestureState) => {
        if (selectedDoctors.length === 0) return;
        let newHeight = panY.current - gestureState.dy;
        const expandedHeight = calculateHeight(true);
        const collapsedHeight = calculateHeight(false);

        if (newHeight > expandedHeight) newHeight = expandedHeight + (newHeight - expandedHeight) * 0.3;
        else if (newHeight < collapsedHeight) newHeight = collapsedHeight - (collapsedHeight - newHeight) * 0.3;

        animatedHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (selectedDoctors.length === 0) {
          animateHeight(ZERO_DOCTOR_HEIGHT);
          return;
        }
        animatedHeight.stopAnimation(currentHeight => {
          const expandedHeight = calculateHeight(true);
          const collapsedHeight = calculateHeight(false);
          const halfway = (expandedHeight + collapsedHeight) / 2;

          const expand =
            gestureState.dy < -10 || (gestureState.dy >= -10 && gestureState.dy <= 10 && currentHeight > halfway);
          setIsExpanded(expand);
          animateHeight(expand ? expandedHeight : collapsedHeight);
        });
      },
    })
  ).current;

  useEffect(() => {
    const target = calculateHeight(isExpanded);
    animateHeight(target);
  }, [selectedDoctors.length]);

  return (
    <View style={styles.footer}>
      <Animated.View
        style={[styles.doctorListContainer, { height: animatedHeight }]}
        {...(selectedDoctors.length > 0 ? panResponder.panHandlers : {})}
      >
        {selectedDoctors.length > 0 && <ExpandHandle isExpanded={isExpanded} onPress={toggleExpand} />}
        {selectedDoctors.length > 0 && (
          <DoctorTagList doctors={selectedDoctors} doctorTimes={doctorTimes} tagWidth={TAG_WIDTH} />
        )}
      </Animated.View>

      <TouchableOpacity
        style={[styles.nextButton, { opacity: selectedDoctors.length > 0 ? 1 : 0.6 }]}
        disabled={selectedDoctors.length === 0}
        onPress={onNext}
      >
        <Text style={styles.nextButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  doctorListContainer: {
    overflow: 'hidden',
    marginBottom: 8,
  },
  nextButton: {
    backgroundColor: COLORS.lightBlue,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  nextButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});

export default SelectedFooter;