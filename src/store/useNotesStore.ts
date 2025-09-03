import { create } from "zustand";
import { noteClient } from "@/api/apoloClient";
import { GET_NOTES } from "@/api/queries/noteQueries";
import { CREATE_NOTE, REMOVE_NOTE, UPDATE_NOTE } from "@/api/mutations/noteMutations";

export type Note = {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

type NotesState = {
  notes: Note[];
  loading: boolean;
  error?: string;
  fetchNotes: () => Promise<void>;
  addNote: (input: { title: string; content: string; metadata?: object }) => Promise<void>;
  updateNote: (input: { id: string; title?: string; content?: string; metadata?: object }) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,

  fetchNotes: async () => {
    set({ loading: true });
    try {
      const { data } = await noteClient.query({ query: GET_NOTES, fetchPolicy: "network-only" });
      set({ notes: data.notes, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addNote: async (input) => {
    try {
      const { data } = await noteClient.mutate({ mutation: CREATE_NOTE, variables: { input } });
      set({ notes: [data.createNote, ...get().notes] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateNote: async (input) => {
    try {
      const { data } = await noteClient.mutate({ mutation: UPDATE_NOTE, variables: { input } });
      set({
        notes: get().notes.map((n) => (n.id === data.updateNote.id ? data.updateNote : n)),
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  removeNote: async (id) => {
    try {
      const { data } = await noteClient.mutate({ mutation: REMOVE_NOTE, variables: { id } });
      if (data.removeNote) {
        set({ notes: get().notes.filter((n) => n.id !== id) });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
