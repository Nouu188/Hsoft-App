import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import type { GoalInputModalProps } from '../types';

/**
 * GoalInputModal
 * 
 * Modal nhập mục tiêu cho 1 loại thống kê (ví dụ: giấc ngủ, calo, nước uống).
 * 
 * Props:
 * - visible: boolean → có hiển thị modal hay không.
 * - pendingStat: Stat | null → thống kê đang chọn để đặt mục tiêu.
 * - goalValue: string → giá trị mục tiêu hiện tại (chuỗi số).
 * - setGoalValue: (v: string) => void → cập nhật giá trị nhập.
 * - onConfirm: () => void → gọi khi bấm nút "Xác nhận".
 * - onCancel: () => void → gọi khi bấm nút "Huỷ".
 */
const GoalInputModal: React.FC<GoalInputModalProps> = ({
  visible,
  pendingStat,
  goalValue,
  setGoalValue,
  onConfirm,
  onCancel,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>Nhập mục tiêu cho "{pendingStat?.title}"</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={
            pendingStat?.key === 'sleep'
              ? 'Nhập số giờ ngủ (vd: 8)'
              : pendingStat?.key === 'calories'
              ? 'Nhập calo mục tiêu (vd: 2000)'
              : pendingStat?.key === 'water'
              ? 'Nhập ml nước (vd: 2000)'
              : 'Nhập số...'
          }
          value={goalValue}          
          onChangeText={(text) => setGoalValue(text.replace(/[^0-9]/g, ''))}
        />

        <TouchableOpacity style={[styles.optionBtn, { backgroundColor: COLORS.primary }]} onPress={onConfirm}>
          <Text style={[styles.optionText, { color: '#fff' }]}>Xác nhận</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.optionBtn, { backgroundColor: '#eee' }]} onPress={onCancel}>
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
    alignItems: 'center' 
  },
  content: { 
    width: '80%', 
    backgroundColor: COLORS.white, 
    borderRadius: 12, 
    padding: 20 
  },
  title: { 
    ...FONTS.h3, 
    marginBottom: 12, 
    textAlign: 'center', 
    color: COLORS.text 
  },
  optionBtn: { 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
  optionText: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: COLORS.primary 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 16, 
    textAlign: 'center' 
  },
});

export default GoalInputModal;
