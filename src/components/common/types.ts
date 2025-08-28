export interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}
export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  activeFilterCount: number;
}
export interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onOptionPress: (index: number) => void;
}