import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '@/constants/theme';

interface ExpandHandleProps {
  isExpanded: boolean;
  onPress: () => void;
}

const ExpandHandle: React.FC<ExpandHandleProps> = ({ isExpanded, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.handleArea}>
      <Ionicons
        name={isExpanded ? 'chevron-down' : 'chevron-up'}
        size={24}
        color={COLORS.placeHolderIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  handleArea: {
    paddingVertical: 6,
    alignItems: 'center',
  },
});

export default ExpandHandle;