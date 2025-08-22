// src/screens/Note/components/NoteList.tsx
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import NoteItem, { Note } from './NoteItem';
import { SIZES } from '@/constants/theme';

interface NoteListProps {
  notes: Note[];
  onNotePress: (note: Note) => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onNotePress }) => {
  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NoteItem note={item} onPress={() => onNotePress(item)} />
      )}
      contentContainerStyle={styles.notesListContainer}
    />
  );
};

const styles = StyleSheet.create({
  notesListContainer: {
    padding: SIZES.padding,
  },
});

export default NoteList;