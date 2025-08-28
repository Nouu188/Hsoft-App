import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { CreateNoteHeaderProps } from './types'; 
// Component CreateNoteHeader: phần header khi tạo ghi chú
const CreateNoteHeader: React.FC<CreateNoteHeaderProps> = ({ onClose, onSave }) => {
  return (
    <View style={styles.header}>
      {/* Nút quay lại */}
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
      </TouchableOpacity>

      {/* Nhóm các nút chức năng bên phải */}
      <View style={styles.headerActions}>
        {/* Nút undo (hiện chưa gắn logic) */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="return-up-back-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Nút redo (hiện chưa gắn logic) */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="return-up-forward-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Nút lưu */}
        <TouchableOpacity style={styles.iconButton} onPress={onSave}>
          <Ionicons name="checkmark-outline" size={28} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.padding, 
    paddingBottom: SIZES.padding, 
    paddingTop: SIZES.padding * 2, 
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 20 },
});

export default CreateNoteHeader;
