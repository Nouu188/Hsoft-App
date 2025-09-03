import { Note } from "@/store/useNotesStore";

export interface CreateNoteHeaderProps {
  onClose: () => void;
  onSave: () => void; 
}

export interface HeaderProps {
  onBackPress: () => void;  
  onSettingsPress: () => void;  
}

export interface NoteItemProps {
  note: Note;   
  onPress: () => void; 
}

export interface NoteListProps {
  notes: Note[];                 
  onNotePress: (note: Note) => void; 
}

export interface SearchBarProps {
  value: string;           
  onChangeText: (text: string) => void; 
}
