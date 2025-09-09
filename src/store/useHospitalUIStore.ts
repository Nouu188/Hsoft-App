import { create } from 'zustand';

interface HospitalUIState {
  sectionExpanded: { [key: string]: boolean };
  dropdownVisible: boolean;
  hospitalSelected: boolean; // ✅ thêm trạng thái đã chọn BV

  setSectionExpanded: (key: string, expanded: boolean) => void;
  setDropdownVisible: (visible: boolean) => void;
  setHospitalSelected: (selected: boolean) => void; // ✅ setter
}

export const useHospitalUIStore = create<HospitalUIState>((set) => ({
  sectionExpanded: { hospital: true, bookingType: false },
  dropdownVisible: false,
  hospitalSelected: false,

  setSectionExpanded: (key, expanded) =>
    set((state) => ({
      sectionExpanded: { ...state.sectionExpanded, [key]: expanded },
    })),

  setDropdownVisible: (visible) => set({ dropdownVisible: visible }),
  setHospitalSelected: (selected) => set({ hospitalSelected: selected }),
}));
