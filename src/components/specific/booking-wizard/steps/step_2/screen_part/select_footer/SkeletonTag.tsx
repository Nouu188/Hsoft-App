import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

interface SkeletonTagProps {
  width: number;
}

const SkeletonTag: React.FC<SkeletonTagProps> = ({ width }) => {
  return (
    <SkeletonPlaceholder>
      <View style={{ width, height: 62, borderRadius: 12 }} />
    </SkeletonPlaceholder>
  );
};

export default SkeletonTag;
