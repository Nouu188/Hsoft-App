import { SIZES } from '@/constants/theme';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import NoteItem from './NoteItem';
import { NoteListProps, ThemedNoteListProps } from './types';

const NoteList: React.FC<ThemedNoteListProps> = ({ notes, onNotePress, theme }) => {
  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[styles.notesListContainer, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false} // ẩn scroll bar
      renderItem={({ item }) => (
        <NoteItem
          note={item}
          onPress={() => onNotePress(item)}
          theme={theme}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  notesListContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 5, // để FAB không che nội dung
  },
});

export default NoteList;
