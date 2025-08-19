// src/components/AddStatModal.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, FONTS } from '@/constants/theme';

// --- Props cho component này ---
interface AddStatModalProps {
  onPress: () => void;
}

const AddStatModal: React.FC<AddStatModalProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <Ionicons name="add-outline" size={32} color={COLORS.textLight} />
      <Text style={styles.addButtonText}>Thêm</Text>
    </TouchableOpacity>
  );
};

// --- Styles cho Component này ---
const styles = StyleSheet.create({
  addButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EAEBF0', // Sửa lại mã màu (có vẻ 'O' là lỗi gõ phím)
    borderStyle: 'dashed',
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.white
  },
  addButtonText: {
    ...FONTS.h3,
    color: COLORS.textLight,
    marginTop: SIZES.base,
  },
});

export default AddStatModal;