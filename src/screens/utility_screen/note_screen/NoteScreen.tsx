// src/screens/Note/NoteScreen.tsx
import React, { useState, useMemo } from 'react'; // <-- BƯỚC 1: Import useMemo
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SHADOWS, SIZES } from '@/constants/theme';
import Animated from 'react-native-reanimated';

import CreateNoteScreen from './CreateNoteScreen';
import Header from '@/components/specific/home/note/NoteHeader';
import SearchBar from '@/components/specific/home/note/NoteSearchBar';
import NoteList from '@/components/specific/home/note/NoteList';
import EmptyState from '@/components/specific/home/note/NoteEmptyState';
import { Note } from '@/components/specific/home/note/NoteItem';

import { useMorphingAnimation } from '@/hooks/useMorphingAnimation';

const FAB_CONFIG = {
  size: 60,
  bottom: 30 + (SIZES.padding ? SIZES.padding * 3 : 24),
  right: 30,
};

const NoteScreen = ({ navigation }: { navigation: any }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    isExpanded,
    animationProgress,
    handleToggleNoteView,
    morphingStyle,
    iconStyle,
  } = useMorphingAnimation(FAB_CONFIG);

  const handleAddNote = (note: { title: string; content: string }) => {
    const newNote: Note = {
      id: Date.now().toString(),
      ...note,
      timestamp: Date.now(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    handleToggleNoteView();
  };

  const handleNotePress = (note: Note) => {
    console.log('Pressed note:', note.id);
  };

  // BƯỚC 2: Dùng useMemo để tạo danh sách đã được lọc
  const filteredNotes = useMemo(() => {
    // Nếu không có từ khóa tìm kiếm, trả về toàn bộ danh sách
    if (!searchQuery) {
      return notes;
    }

    // Chuyển từ khóa tìm kiếm về chữ thường để tìm kiếm không phân biệt hoa/thường
    const lowercasedQuery = searchQuery.toLowerCase();

    // Lọc danh sách notes
    return notes.filter(
      note =>
        // Kiểm tra xem tiêu đề có chứa từ khóa không
        note.title.toLowerCase().includes(lowercasedQuery) ||
        // Hoặc kiểm tra xem nội dung có chứa từ khóa không
        note.content.toLowerCase().includes(lowercasedQuery)
    );
  }, [notes, searchQuery]); // Phụ thuộc: Chỉ chạy lại khi `notes` hoặc `searchQuery` thay đổi

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightGray} />

      <Header onBackPress={() => navigation.goBack()} onSettingsPress={() => {}} />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <View style={styles.mainContent}>
        {/* BƯỚC 3: Sử dụng `filteredNotes` để hiển thị */}
        {filteredNotes.length === 0 
          ? <EmptyState /> 
          : <NoteList notes={filteredNotes} onNotePress={handleNotePress} />
        }
      </View>

      <View style={styles.morphingContainer} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleToggleNoteView}
          disabled={isExpanded}
        >
          <Animated.View style={[morphingStyle, SHADOWS.medium]}>
            {isExpanded ? (
              <CreateNoteScreen
                isVisibleProgress={animationProgress}
                onClose={handleToggleNoteView}
                onSave={handleAddNote}
              />
            ) : (
              <Animated.View style={[styles.fabIconContainer, iconStyle]}>
                <Ionicons name="add-outline" size={30} color={COLORS.primary} />
              </Animated.View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  mainContent: { flex: 1 },
  morphingContainer: { position: 'absolute', bottom: FAB_CONFIG.bottom, right: FAB_CONFIG.right, width: FAB_CONFIG.size, height: FAB_CONFIG.size },
  fabIconContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default NoteScreen;