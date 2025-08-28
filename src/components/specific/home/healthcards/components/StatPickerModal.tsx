import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { StatPickerModalProps } from '../types';

/**
 * StatPickerModal
 *
 * Modal hiển thị danh sách các loại thống kê (Stat) để người dùng chọn thêm vào màn hình.
 *
 * Props (StatPickerModalProps):
 * - visible: boolean → bật/tắt modal
 * - availableStats: Stat[] → danh sách stat còn lại mà người dùng có thể thêm
 * - onSelect: (stat: Stat) => void → callback khi chọn 1 stat
 * - onClose: () => void → callback khi đóng modal
 */
const StatPickerModal: React.FC<StatPickerModalProps> = ({
  visible,
  availableStats,
  onSelect,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose} 
  >
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>Chọn loại thống kê</Text>

        {availableStats.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={styles.optionBtn}
            onPress={() => onSelect(s)}
          >
            <Text style={styles.optionText}>{s.title}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.optionBtn, { backgroundColor: '#eee' }]}
          onPress={onClose}
        >
          <Text style={[styles.optionText, { color: COLORS.text }]}>Huỷ</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    ...FONTS.h3,
    marginBottom: 12,
    textAlign: 'center',
    color: COLORS.text,
  },
  optionBtn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.primary,
  },
});

export default StatPickerModal;
