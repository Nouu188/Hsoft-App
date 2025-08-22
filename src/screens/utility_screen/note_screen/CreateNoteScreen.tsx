// src/screens/Note/CreateNoteScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';
import dayjs from 'dayjs';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import CreateNoteHeader from '@/components/specific/home/note/CreateNoteHeader';


interface CreateNoteScreenProps {
  isVisibleProgress: SharedValue<number>;
  onClose: () => void;
  onSave: (note: { title: string; content: string }) => void;
}

const CreateNoteScreen: React.FC<CreateNoteScreenProps> = ({
  isVisibleProgress,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(isVisibleProgress.value, [0.4, 1], [0, 1]);
    const translateY = interpolate(isVisibleProgress.value, [0.4, 1], [10, 0]);
    return { opacity, transform: [{ translateY }] };
  });

  const handleSave = () => {
    if (title.trim() === '' && content.trim() === '') {
      onClose(); // Không lưu ghi chú rỗng, chỉ đóng lại
      return;
    }
    onSave({ title, content });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.contentWrapper, contentAnimatedStyle]}>
        <CreateNoteHeader onClose={onClose} onSave={handleSave} />

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.titleInput}
            placeholder="Tiêu đề"
            placeholderTextColor={COLORS.placeholderColor}
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.metaText}>
            {dayjs().format('DD [tháng] M HH:mm')}  |  {content.length} ký tự
          </Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Bắt đầu soạn..."
            placeholderTextColor={COLORS.placeholderColor}
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
  container: { flex: 1, backgroundColor: 'transparent' },
  contentWrapper: { flex: 1 },
  titleInput: { fontSize: SIZES.h2, paddingHorizontal: SIZES.padding, color: COLORS.text },
  metaText: { fontSize: SIZES.body4, color: COLORS.secondary, paddingHorizontal: SIZES.padding, marginVertical: SIZES.base, },
  contentInput: { flex: 1, fontSize: SIZES.body3, paddingHorizontal: SIZES.padding, textAlignVertical: 'top', color: COLORS.text, minHeight: 200, },
});

export default CreateNoteScreen;