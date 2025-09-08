import { Note } from "@/store/useNotesStore";
import { COLORS } from "@/constants/theme";
export interface CreateNoteHeaderProps {
  onClose: () => void;
  onSave: () => void; 
  onDelete?: () => void;               
  mode?: 'create' | 'edit';           
  theme?: typeof COLORS;
}

export interface HeaderProps {
  onBackPress: () => void;  
  onSettingsPress: () => void;  
}
export interface ThemedHeaderProps extends HeaderProps {
  theme: {
    white: string;
    textDark: string;
    text: string;
    border: string;
    primary: string;
  };
}

export interface NoteItemProps {
  note: Note;   
  onPress: () => void; 
  theme: {
    white: string;
    textDark: string;
    text: string;
    secondary: string;
  },
}

export interface NoteListProps {
  notes: Note[];                 
  onNotePress: (note: Note) => void; 
}
export interface ThemedNoteListProps extends NoteListProps {
  theme: {
    background: string;
    white: string;
    text: string;
    textDark: string;
    secondary: string;
  };
}
export interface SearchBarProps {
  value: string;           
  onChangeText: (text: string) => void; 
}
export interface ThemedSearchBarProps extends SearchBarProps {
  theme: {
    background: string;
    white: string;
    text: string;
    textDark: string;
    secondary: string;
  };
}
