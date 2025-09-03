import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

const CreateNoteHeader = ({ onClose, onSave, onDelete, mode = 'create' }: any) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} /></TouchableOpacity>
    <Text style={styles.title}>{mode === 'create' ? 'Tạo ghi chú' : 'Chỉnh sửa ghi chú'}</Text>
    <View style={{ flexDirection: 'row' }}>
      {mode === 'edit' && onDelete && (
        <TouchableOpacity onPress={onDelete} style={{ marginRight: 12 }}>
          <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onSave}>
        <Text style={styles.save}>Lưu</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.padding },
  title: { ...FONTS.h3 },
  save: { color: COLORS.primary, fontWeight: '600' },
});

export default CreateNoteHeader;
