// NoteScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Text,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import Animated from "react-native-reanimated";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";

import CreateNoteScreen from "./CreateNoteScreen";
import Header from "@/components/specific/home/note/NoteHeader";
import SearchBar from "@/components/specific/home/note/NoteSearchBar";
import NoteList from "@/components/specific/home/note/NoteList";
import EmptyState from "@/components/specific/home/note/NoteEmptyState";

import { useMorphingAnimation } from "@/hooks/useMorphingAnimation";
import { useNotesStore } from "@/store/useNotesStore";
import { Note } from "@/store/useNotesStore";

const FAB_CONFIG = {
  size: 60,
  bottom: 30 + (SIZES.padding ? SIZES.padding * 3 : 24),
  right: 30,
};

const NoteScreen = ({ navigation }: { navigation: any }) => {
  const { notes, fetchNotes, addNote, updateNote, removeNote, loading, error } = useNotesStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const {
    isExpanded,
    animationProgress,
    handleToggleNoteView,
    morphingStyle,
    iconStyle,
  } = useMorphingAnimation(FAB_CONFIG);

  // fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // search filter
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  // CRUD handlers
  const handleAddNote = async (payload: {
    title: string;
    content: string;
    metadata?: object;
  }) => {
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lightGray} />

      <Header
        onBackPress={() => navigation.goBack()}
        onSettingsPress={() => {}}
      />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      <View style={styles.mainContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : filteredNotes.length === 0 ? (
          <EmptyState />
        ) : (
          <NoteList notes={filteredNotes} onNotePress={handleNotePress} />
        )}
      </View>

      {/* Morphing FAB */}
      <View style={styles.morphingContainer} pointerEvents="box-none">
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
          <Animated.View style={[morphingStyle, SHADOWS.medium]}>
            {isExpanded ? (
              <CreateNoteScreen
                isVisibleProgress={animationProgress}
                onClose={() => {
                  setActiveNote(null);
                  handleToggleNoteView();
                }}
                onSave={(payload) => {
                  if (editorMode === "create") {
                    handleAddNote(payload);
                  } else if (editorMode === "edit" && activeNote) {
                    handleUpdateNote({
                      ...activeNote,
                      ...payload,
                      updatedAt: new Date().toISOString(),
                    });
                  }
                }}
                onDelete={(noteId) => {
                  if (editorMode === "edit") handleDeleteNote(noteId);
                }}
                note={activeNote ?? undefined}
                mode={editorMode}
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
  morphingContainer: {
    position: "absolute",
    bottom: FAB_CONFIG.bottom,
    right: FAB_CONFIG.right,
    width: FAB_CONFIG.size,
    height: FAB_CONFIG.size,
  },
  fabIconContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default NoteScreen;
