import { COLORS, SHADOWS, SIZES } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { NoteItemProps } from './types';

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress }) => {
  return (
    <TouchableOpacity style={styles.noteItem} onPress={onPress}>
      <Text style={styles.noteTitle} numberOfLines={1}>
        {note.title || 'Không có tiêu đề'}
      </Text>

      <Text style={styles.noteContent} numberOfLines={2}>
        {note.content}
      </Text>

      <Text style={styles.noteTimestamp}>
        {new Date(note.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

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
