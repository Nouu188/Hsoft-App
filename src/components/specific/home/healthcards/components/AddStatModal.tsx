import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SIZES, FONTS, COLORS } from '@/constants/theme';
import { DARK_COLORS } from '@/constants/theme';
import { useThemeStore } from '@/store/useThemeStore';
import type { AddStatModalProps } from '../types';

/**
 * Nút thêm thống kê mới (AddStatModal).
 *
 * Props:
 * - onPress: hàm gọi khi bấm vào nút.
 */
const AddStatModal: React.FC<AddStatModalProps> = ({ onPress }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? DARK_COLORS : COLORS;

  return (
    <TouchableOpacity
      style={[
        styles.addButton,
        { borderColor: theme.border, backgroundColor: theme.white },
      ]}
      onPress={onPress}
    >
      <Ionicons name="add-outline" size={32} color={theme.textLight} />
      <Text style={[styles.addButtonText, { color: theme.textLight }]}>
        Thêm
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed', // đường viền nét đứt
    borderRadius: SIZES.radius * 2,
  },
  addButtonText: {
    ...FONTS.h3,
    marginTop: SIZES.base,
  },
});

export default AddStatModal;
