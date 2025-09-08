import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SHADOWS, SIZES, COLORS } from '@/constants/theme';
import { Note } from '@/store/useNotesStore';
import { NoteItemProps } from './types';

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress, theme }) => {
  // Kiểm tra createdAt hợp lệ, fallback nếu không hợp lệ
  const formattedDate = note.createdAt
    ? (() => {
        const d = new Date(note.createdAt);
        return isNaN(d.getTime()) ? 'Không xác định' : d.toLocaleDateString();
      })()
    : 'Không xác định';

  return (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: theme.white }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.noteTitle, { color: theme.textDark }]} numberOfLines={1}>
        {note.title || 'Không có tiêu đề'}
      </Text>

      <Text style={[styles.noteContent, { color: theme.text }]} numberOfLines={2}>
        {note.content || 'Không có nội dung'}
      </Text>

      <Text style={[styles.noteTimestamp, { color: theme.secondary }]}>
        {formattedDate}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteItem: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    ...SHADOWS.light,
  },
  noteTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
  },
  noteContent: {
    fontSize: SIZES.body4,
    marginVertical: SIZES.base,
  },
  noteTimestamp: {
    fontSize: SIZES.body5,
    textAlign: 'right',
  },
});

export default NoteItem;
