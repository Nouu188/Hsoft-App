// src/components/shared/ConfirmationModal.tsx

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
}) => {
  
  const handleConfirm = () => {
    onConfirm();
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
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  modalContent: { width: '100%', backgroundColor: COLORS.white, borderRadius: SIZES.radius * 1.5, padding: SIZES.padding, elevation: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: SIZES.padding / 2, textAlign: 'center' },
  message: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginBottom: SIZES.padding * 1.5, lineHeight: 24 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  button: { flex: 1, padding: 14, borderRadius: SIZES.radius, alignItems: 'center' },
  cancelButton: { backgroundColor: COLORS.lightGray },
  confirmButton: { backgroundColor: COLORS.primary },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  cancelButtonText: { color: COLORS.textDark },
  confirmButtonText: { color: COLORS.white },
});

export default ConfirmationModal;