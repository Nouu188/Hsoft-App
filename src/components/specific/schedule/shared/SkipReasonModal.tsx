// src/components/shared/SkipReasonModal.tsx

import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';

const COMMON_REASONS = [
  { key: 'FORGOT', text: 'Tôi quên uống thuốc' },
  { key: 'SIDE_EFFECT', text: 'Gặp tác dụng phụ' },
  { key: 'FEELING_BETTER', text: 'Cảm thấy đã khỏe hơn' },
  { key: 'OUT_OF_MEDS', text: 'Hết thuốc' },
];

interface SkipReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: { category: string; detail?: string }) => void;
}

const SkipReasonModal: React.FC<SkipReasonModalProps> = ({ visible, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');

  const handleConfirm = () => {
    if (!selectedReason) return;
    
    const reason = {
      category: selectedReason,
      detail: selectedReason === 'OTHER' ? otherReason : undefined,
    };
    onConfirm(reason);
    resetState();
  };

  const resetState = () => {
    setSelectedReason(null);
    setOtherReason('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.title}>Vui lòng cho biết lý do</Text>
              
              {COMMON_REASONS.map(reason => (
                <TouchableOpacity 
                  key={reason.key} 
                  style={styles.reasonRow} 
                  onPress={() => setSelectedReason(reason.key)}
                >
                  <Ionicons 
                    name={selectedReason === reason.key ? 'radio-button-on' : 'radio-button-off'} 
                    size={24} 
                    color={selectedReason === reason.key ? COLORS.primary : COLORS.textLight} 
                  />
                  <Text style={styles.reasonText}>{reason.text}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.reasonRow} onPress={() => setSelectedReason('OTHER')}>
                <Ionicons 
                  name={selectedReason === 'OTHER' ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color={selectedReason === 'OTHER' ? COLORS.primary : COLORS.textLight} 
                />
                <Text style={styles.reasonText}>Lý do khác</Text>
              </TouchableOpacity>

              {selectedReason === 'OTHER' && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập lý do chi tiết..."
                  value={otherReason}
                  onChangeText={setOtherReason}
                  multiline
                />
              )}

              <TouchableOpacity 
                style={[styles.confirmButton, !selectedReason && styles.disabledButton]} 
                onPress={handleConfirm}
                disabled={!selectedReason}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
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
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: SIZES.padding, textAlign: 'center' },
  reasonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  reasonText: { fontSize: 16, color: COLORS.textDark, marginLeft: 12 },
  textInput: {
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 10,
    marginTop: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  confirmButton: { backgroundColor: COLORS.primary, padding: 14, borderRadius: SIZES.radius, alignItems: 'center', marginTop: SIZES.padding },
  disabledButton: { backgroundColor: COLORS.lightGray },
  confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default SkipReasonModal;