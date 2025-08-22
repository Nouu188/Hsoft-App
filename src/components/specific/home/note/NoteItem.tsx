// src/screens/Note/components/NoteItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

// Định nghĩa kiểu dữ liệu Note để có thể tái sử dụng
export interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

interface NoteItemProps {
  note: Note;
  onPress: () => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress }) => {
  return (
    <TouchableOpacity style={styles.noteItem} onPress={onPress}>
      <Text style={styles.noteTitle} numberOfLines={1}>{note.title || 'Không có tiêu đề'}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>{note.content}</Text>
      <Text style={styles.noteTimestamp}>
        {new Date(note.timestamp).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteItem: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.padding, marginBottom: SIZES.base, ...SHADOWS.light, },
  noteTitle: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text, },
  noteContent: { fontSize: SIZES.body4, color: COLORS.secondary, marginVertical: SIZES.base, },
  noteTimestamp: { fontSize: SIZES.body5, color: COLORS.secondary, textAlign: 'right', },
});

export default NoteItem;