import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, FONTS } from '@/constants/theme';
import type { AddStatModalProps } from '../types';

/**
 * Nút thêm thống kê mới (AddStatModal).
 * 
 * Props:
 * - onPress: hàm gọi khi bấm vào nút.
 */
const AddStatModal: React.FC<AddStatModalProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Ionicons name="add-outline" size={32} color={COLORS.textLight} />
      <Text style={styles.addButtonText}>Thêm</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Khung nút
  addButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EAEBF0',
    borderStyle: 'dashed', // đường viền nét đứt
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.white
  },
  // Text hiển thị bên dưới icon
  addButtonText: {
    ...FONTS.h3,
    color: COLORS.textLight,
    marginTop: SIZES.base,
  },
});

export default AddStatModal;
