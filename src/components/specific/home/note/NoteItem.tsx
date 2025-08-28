// Component NoteItem
// - Dùng để hiển thị một ghi chú trong danh sách
// - Gồm: tiêu đề, nội dung ngắn, và thời gian tạo
// - Có thể bấm vào (TouchableOpacity) để mở chi tiết ghi chú

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { NoteItemProps } from './types'; 

// Nhận props: 
// - note: dữ liệu của ghi chú (id, title, content, timestamp)
// - onPress: hàm xử lý khi người dùng bấm vào ghi chú
const NoteItem: React.FC<NoteItemProps> = ({ note, onPress }) => {
  return (
    <TouchableOpacity style={styles.noteItem} onPress={onPress}>
      {/* Tiêu đề ghi chú (nếu trống thì hiển thị "Không có tiêu đề") */}
      <Text style={styles.noteTitle} numberOfLines={1}>
        {note.title || 'Không có tiêu đề'}
      </Text>

      {/* Nội dung hiển thị tối đa 2 dòng */}
      <Text style={styles.noteContent} numberOfLines={2}>
        {note.content}
      </Text>

      {/* Thời gian tạo ghi chú (dạng ngày) */}
      <Text style={styles.noteTimestamp}>
        {new Date(note.timestamp).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};
// StyleSheet cho NoteItem
const styles = StyleSheet.create({
  noteItem: { 
    backgroundColor: COLORS.white, 
    borderRadius: SIZES.radius, 
    padding: SIZES.padding, 
    marginBottom: SIZES.base, 
    ...SHADOWS.light 
  },
  noteTitle: { 
    fontSize: SIZES.h2, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },
  noteContent: { 
    fontSize: SIZES.body4, 
    color: COLORS.secondary, 
    marginVertical: SIZES.base 
  },
  noteTimestamp: { 
    fontSize: SIZES.body5, 
    color: COLORS.secondary, 
    textAlign: 'right' 
  },
});

export default NoteItem;
