import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import dayjs from 'dayjs';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import CreateNoteHeader from '@/components/specific/home/note/CreateNoteHeader';
import { Note } from '@/store/useNotesStore';

interface CreateNoteScreenProps {
  isVisibleProgress: SharedValue<number>;
  onClose: () => void;
  onSave: (note: { title: string; content: string }) => void;
  onDelete?: (noteId: string) => void;
  note?: Note;
  mode?: 'create' | 'edit';
  theme?: typeof COLORS; // thêm prop theme
}

const CreateNoteScreen: React.FC<CreateNoteScreenProps> = ({
  isVisibleProgress,
  onClose,
  onSave,
  onDelete,
  note,
  mode = 'create',
  theme = COLORS,
}) => {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
  }, [note?.id]);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(isVisibleProgress.value, [0.4, 1], [0, 1]);
    const translateY = interpolate(isVisibleProgress.value, [0.4, 1], [10, 0]);
    return { opacity, transform: [{ translateY }] };
  });

  const handleSave = () => {
    if (title.trim() === '' && content.trim() === '') {
      onClose();
      return;
    }
    onSave({ title: title.trim(), content: content.trim() });
  };

  const handleDelete = () => {
    if (mode === 'edit' && note && onDelete) {
      onDelete(note.id);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.contentWrapper, contentAnimatedStyle]}>
        {/* Header */}
        <CreateNoteHeader
          onClose={onClose}
          onSave={handleSave}
          onDelete={mode === 'edit' ? handleDelete : undefined}
          mode={mode}
          theme={theme}
        />

        {/* Scrollable content */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tiêu đề */}
          <TextInput
            style={[styles.titleInput, { color: theme.text }]}
            placeholder="Tiêu đề"
            placeholderTextColor={theme.placeholderColor}
            value={title}
            onChangeText={setTitle}
          />

          {/* Meta info */}
          <Text style={[styles.metaText, { color: theme.secondary }]}>
            {dayjs().format('DD [tháng] M HH:mm')}  |  {content.length} ký tự
          </Text>

          {/* Nội dung */}
          <TextInput
            style={[styles.contentInput, { color: theme.text, backgroundColor: theme.background }]}
            placeholder="Bắt đầu soạn..."
            placeholderTextColor={theme.placeholderColor}
            multiline
            autoFocus={true}
            value={content}
            onChangeText={setContent}
          />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1 },
  titleInput: {
    fontSize: SIZES.h2,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    fontWeight: '600',
  },
  metaText: {
    fontSize: SIZES.body4,
    paddingHorizontal: SIZES.padding,
    marginVertical: SIZES.base,
  },
  contentInput: {
    flex: 1,
    fontSize: SIZES.body3,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    textAlignVertical: 'top',
    minHeight: 200,
  },
});

export default CreateNoteScreen;
