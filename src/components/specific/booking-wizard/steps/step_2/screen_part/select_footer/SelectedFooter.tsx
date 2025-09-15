import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';
import { Entity } from '@/components/specific/schedule/appointment/components/doctor_list/EntityCard';
import EntityTagList from './EntityTagList';
import ExpandHandle from './ExpandHandle';

interface SelectedFooterProps {
  selectedDoctors: Entity[];
  selectedClinics?: Entity[];
  entityTimes: Record<string, string | undefined>;
  onNext: () => void;
}

const screenWidth = Dimensions.get('window').width;
const PADDING_HORIZONTAL = SIZES.padding * 2;
const TAG_MARGIN = 6;
const TAG_HEIGHT = 30;
const HANDLE_HEIGHT = 16;
const FOOTER_PADDING_BOTTOM = SIZES.padding;
const ZERO_ENTITY_HEIGHT = HANDLE_HEIGHT + FOOTER_PADDING_BOTTOM;

const SelectedFooter: React.FC<SelectedFooterProps> = ({
  selectedDoctors,
  selectedClinics = [],
  entityTimes,
  onNext,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allEntities = [...selectedDoctors, ...selectedClinics];

  const calculateHeight = (expanded: boolean) => {
    const numEntities = allEntities.length;
    if (numEntities === 0) return ZERO_ENTITY_HEIGHT;
    const rows = expanded ? Math.ceil(numEntities / 2) : 1;
    return rows * (TAG_HEIGHT + TAG_MARGIN) + HANDLE_HEIGHT + SIZES.base * 2;
  };

  const animatedHeight = useRef(new Animated.Value(calculateHeight(false))).current;

  const animateHeight = (targetHeight: number) => {
    Animated.timing(animatedHeight, { toValue: targetHeight, duration: 200, useNativeDriver: false }).start();
  };

  const toggleExpand = () => {
    if (allEntities.length === 0) return;
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
        allEntities.length > 0 && Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        animatedHeight.stopAnimation(value => (panY.current = value));
      },
      onPanResponderMove: (_, gestureState) => {
        if (allEntities.length === 0) return;
        let newHeight = panY.current - gestureState.dy;
        const expandedHeight = calculateHeight(true);
        const collapsedHeight = calculateHeight(false);

        if (newHeight > expandedHeight) newHeight = expandedHeight + (newHeight - expandedHeight) * 0.3;
        else if (newHeight < collapsedHeight) newHeight = collapsedHeight - (collapsedHeight - newHeight) * 0.3;

        animatedHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (allEntities.length === 0) {
          animateHeight(ZERO_ENTITY_HEIGHT);
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
  }, [allEntities.length]);

  return (
    <View style={styles.footer}>
      <Animated.View
        style={[styles.entityListContainer, { height: animatedHeight }]}
        {...(allEntities.length > 0 ? panResponder.panHandlers : {})}
      >
        {allEntities.length > 0 && <ExpandHandle isExpanded={isExpanded} onPress={toggleExpand} />}
        {allEntities.length > 0 && (
          <EntityTagList entities={allEntities} entityTimes={entityTimes} tagWidth={(screenWidth - PADDING_HORIZONTAL - TAG_MARGIN) / 2} />
        )}
      </Animated.View>

      <TouchableOpacity
        style={[styles.nextButton, { opacity: allEntities.length > 0 ? 1 : 0.6 }]}
        disabled={allEntities.length === 0}
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
  entityListContainer: {
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
