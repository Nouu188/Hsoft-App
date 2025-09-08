import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SIZES, FONTS, COLORS } from '@/constants/theme';
import type { CreateNoteHeaderProps } from './types';
import { useThemeStore } from '@/store/useThemeStore';
const CreateNoteHeader: React.FC<CreateNoteHeaderProps> = ({
  onClose,
  onSave,
  onDelete,
  mode = 'create',
  theme = COLORS,
}) => {
  const { isDarkMode } = useThemeStore();
  return (
    <View style={[styles.header]}>
      {/* nút đóng */}
      <TouchableOpacity onPress={onClose} style={styles.iconButton}>
        <Ionicons name="close" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* tiêu đề */}
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {mode === 'create' ? 'Tạo ghi chú' : 'Chỉnh sửa ghi chú'}
      </Text>

      {/* hành động */}
      <View style={styles.actionButtons}>
        {mode === 'edit' && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={22} color={theme.danger} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onSave} style={styles.iconButton}>
          <Text style={[styles.saveText, { color: isDarkMode ? theme.lightBlue :theme.primary }]}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    marginTop: 20,
  },
  iconButton: {
    paddingHorizontal: 4,
  },
  title: {
    ...FONTS.h3,
    flex: 1,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontWeight: '600',
    fontSize: SIZES.body3,
  },
});

export default CreateNoteHeader;
