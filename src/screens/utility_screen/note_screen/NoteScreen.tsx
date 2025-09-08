import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Text,
  useWindowDimensions,
  Platform,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import Animated from "react-native-reanimated";

import { SIZES, SHADOWS, COLORS } from "@/constants/theme";
import { useThemeStore } from "@/store/useThemeStore";

import CreateNoteScreen from "./CreateNoteScreen";
import Header from "@/components/specific/home/note/NoteHeader";
import SearchBar from "@/components/specific/home/note/NoteSearchBar";
import NoteList from "@/components/specific/home/note/NoteList";
import EmptyState from "@/components/specific/home/note/NoteEmptyState";

import { useMorphingAnimation } from "@/hooks/useMorphingAnimation";
import { useNotesStore, Note } from "@/store/useNotesStore";

const NoteScreen = ({ navigation }: { navigation: any }) => {
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;
  const isSmallDevice = width < 360;

  // ✅ Lấy theme từ zustand
  const { theme, isDarkMode } = useThemeStore();

  const FAB_CONFIG = {
    size: isSmallDevice ? 50 : 60,
    bottom:
      (Platform.OS === "ios" ? 70 : 60) +
      (SIZES.padding ? SIZES.padding * (isPortrait ? 2 : 1) : 20),
    right: isSmallDevice ? 20 : 30,
  };

  const { notes, fetchNotes, addNote, updateNote, removeNote, loading, error } =
    useNotesStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const {
  isExpanded,
  animationProgress,
  handleToggleNoteView,
  morphingStyle,
  iconStyle,
} = useMorphingAnimation({ ...FAB_CONFIG, isDarkMode });

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const handleAddNote = async (payload: { title: string; content: string; metadata?: object }) => {
    await addNote(payload);
    setActiveNote(null);
    handleToggleNoteView();
  };

  const handleUpdateNote = async (updated: Note) => {
    await updateNote(updated);
    setActiveNote(null);
    handleToggleNoteView();
  };

  const handleDeleteNote = async (noteId: string) => {
    await removeNote(noteId);
    setActiveNote(null);
    handleToggleNoteView();
  };

  const handleNotePress = (note: Note) => {
    setActiveNote(note);
    if (!isExpanded) handleToggleNoteView();
  };

  const editorMode: "create" | "edit" = activeNote ? "edit" : "create";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      {/* Header */}
      <Header
        onBackPress={() => navigation.goBack()}
        onSettingsPress={() => {}}
        theme={theme}
      />

      <View
        style={[
          styles.contentWrapper,
          { flexDirection: isPortrait ? "column" : "row" },
        ]}
      >
        <View style={[styles.searchWrapper, !isPortrait && { flex: 0.4 }]}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} theme={theme} />
        </View>

        <View style={[styles.mainContent, !isPortrait && { flex: 0.6 }]}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : error ? (
            <Text style={[styles.errorText, { color: theme.accent }]}>{error}</Text>
          ) : filteredNotes.length === 0 ? (
            <EmptyState theme={theme} />
          ) : (
            <NoteList notes={filteredNotes} onNotePress={handleNotePress} theme={theme} />
          )}
        </View>
      </View>

      {/* Morphing FAB chính */}
      <View
        style={[
          styles.morphingContainer,
          {
            bottom: FAB_CONFIG.bottom,
            right: FAB_CONFIG.right,
            width: FAB_CONFIG.size,
            height: FAB_CONFIG.size,
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (!isExpanded) {
              setActiveNote(null);
              handleToggleNoteView();
            }
          }}
          disabled={isExpanded}
        >
          <Animated.View
            style={[
              morphingStyle,
              SHADOWS.medium,
              { backgroundColor: theme.primary },
            ]}
          >
            {isExpanded ? (
              <CreateNoteScreen
                isVisibleProgress={animationProgress}
                onClose={() => {
                  setActiveNote(null);
                  handleToggleNoteView();
                }}
                onSave={(payload) => {
                  if (editorMode === "create") handleAddNote(payload);
                  else if (editorMode === "edit" && activeNote)
                    handleUpdateNote({
                      ...activeNote,
                      ...payload,
                      updatedAt: new Date().toISOString(),
                    });
                }}
                onDelete={(noteId) => {
                  if (editorMode === "edit") handleDeleteNote(noteId);
                }}
                note={activeNote ?? undefined}
                mode={editorMode}
                theme={theme}
              />
            ) : (
              <Animated.View style={[styles.fabIconContainer, iconStyle]}>
                <Ionicons name="add-outline" size={28} color={COLORS.white} />
              </Animated.View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1 },
  searchWrapper: { paddingHorizontal: 10, paddingTop: 5 },
  mainContent: { flex: 1 },
  morphingContainer: { position: "absolute" },
  fabIconContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { textAlign: "center", marginTop: 10 },
});

export default NoteScreen;
