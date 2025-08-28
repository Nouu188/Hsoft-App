import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import NoteItem from './NoteItem'; 
import { SIZES } from '@/constants/theme'; 
import { Note, NoteListProps } from './types';  

// Component NoteList nhận props:
// - notes: danh sách các ghi chú
// - onNotePress: hàm xử lý khi người dùng bấm vào 1 ghi chú
const NoteList: React.FC<NoteListProps> = ({ notes, onNotePress }) => {
  return (
    <FlatList
      // Dữ liệu đưa vào danh sách
      data={notes}

      // Xác định key cho mỗi item -> giúp React Native tối ưu render
      keyExtractor={(item) => item.id}

      // Cách render mỗi item trong danh sách
      renderItem={({ item }) => (
        <NoteItem 
          note={item} 
          onPress={() => onNotePress(item)} // Gọi hàm callback khi bấm vào
        />
      )}

      // Style cho container của list (phần bao quanh nội dung)
      contentContainerStyle={styles.notesListContainer}
    />
  );
};

// Định nghĩa style
const styles = StyleSheet.create({
  notesListContainer: {
    padding: SIZES.padding, // khoảng cách padding từ theme
  },
});

export default NoteList; // Xuất component ra để dùng ở nơi khác
