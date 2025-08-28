// Props cho CreateNoteHeader
export interface CreateNoteHeaderProps {
  onClose: () => void; // Hàm xử lý khi bấm nút quay lại (back)
  onSave: () => void;  // Hàm xử lý khi bấm nút lưu ghi chú
}

// Props cho Header chung
export interface HeaderProps {
  onBackPress: () => void;      // Hàm xử lý khi bấm nút quay lại
  onSettingsPress: () => void;  // Hàm xử lý khi bấm nút cài đặt
}

// Kiểu dữ liệu cho một ghi chú (Note)
export interface Note {
  id: string;        // ID duy nhất cho ghi chú
  title: string;     // Tiêu đề ghi chú
  content: string;   // Nội dung chi tiết của ghi chú
  timestamp: number; // Thời gian tạo/cập nhật (UNIX timestamp)
}

// Props cho component NoteItem (mỗi item trong list)
export interface NoteItemProps {
  note: Note;          // Dữ liệu ghi chú truyền vào
  onPress: () => void; // Hàm xử lý khi bấm vào note
}

// Props cho NoteList (danh sách các ghi chú)
export interface NoteListProps {
  notes: Note[];                     // Danh sách các ghi chú
  onNotePress: (note: Note) => void; // Hàm xử lý khi bấm vào 1 ghi chú cụ thể
}

// Props cho SearchBar (thanh tìm kiếm)
export interface SearchBarProps {
  value: string;                      // Giá trị hiện tại của ô tìm kiếm
  onChangeText: (text: string) => void; // Hàm xử lý khi text thay đổi
}
