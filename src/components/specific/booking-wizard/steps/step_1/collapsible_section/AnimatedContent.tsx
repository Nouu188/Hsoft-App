import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { SIZES } from '@/constants/theme';

interface AnimatedContentProps {
  expanded: boolean;
  children: React.ReactNode;
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({ expanded, children }) => {
  const heightAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      easing: expanded ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight + 25],
  });

  return (
    <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
      <View
        style={styles.content}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    paddingTop: 5,
    minHeight: 40,
  },
});

export default AnimatedContent;
