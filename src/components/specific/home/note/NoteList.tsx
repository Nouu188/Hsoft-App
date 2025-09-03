import { SIZES } from '@/constants/theme';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import NoteItem from './NoteItem';
import { NoteListProps } from './types';

const NoteList: React.FC<NoteListProps> = ({ notes, onNotePress }) => {
  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.notesListContainer}
      renderItem={({ item }) => (
        <NoteItem 
          note={item} 
          onPress={() => onNotePress(item)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  notesListContainer: {
    padding: SIZES.padding, 
  },
});

export default NoteList; 
