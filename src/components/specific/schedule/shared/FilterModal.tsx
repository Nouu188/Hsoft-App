// src/components/specific/schedule/FilterModal.tsx

import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';
import { FilterState } from '@/components/specific/schedule/medication/components/DoseFilter';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onApply: (newFilters: FilterState) => void;
}

const STATUS_OPTIONS: { label: string; value: FilterState['status'] }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Cần uống', value: 'ACTION_NEEDED' },
  { label: 'Đã xong', value: 'COMPLETED' },
  { label: 'Sắp tới', value: 'UPCOMING' },
];

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, currentFilters, onApply }) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(currentFilters);

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.title}>Lọc lịch trình</Text>
              
              <Text style={styles.sectionTitle}>Theo trạng thái</Text>
              <View style={styles.chipContainer}>
                {STATUS_OPTIONS.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.chip, tempFilters.status === item.value && styles.chipActive]}
                    onPress={() => setTempFilters({ ...tempFilters, status: item.value })}
                  >
                    <Text style={[styles.chipText, tempFilters.status === item.value && styles.chipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: COLORS.white, borderRadius: SIZES.radius * 1.5, padding: SIZES.padding, elevation: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: SIZES.padding },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginBottom: SIZES.padding / 2 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.lightGray, borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  chipText: { color: COLORS.textDark, fontWeight: '600' },
  chipTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  applyButton: { backgroundColor: COLORS.primary, padding: 14, borderRadius: SIZES.radius, alignItems: 'center', marginTop: SIZES.padding * 1.5 },
  applyButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default FilterModal;