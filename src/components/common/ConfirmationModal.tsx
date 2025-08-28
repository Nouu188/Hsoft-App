import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';
import type { ConfirmationModalProps } from './types';

// Component Modal xác nhận
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,       // true nếu modal đang hiển thị
  onClose,       // callback khi đóng modal
  onConfirm,     // callback khi người dùng xác nhận
  title,         // tiêu đề modal
  message,       // nội dung thông báo
  confirmText = "Xác nhận", // text nút xác nhận mặc định
  cancelText = "Hủy",       // text nút hủy mặc định
}) => {

  // Hàm xử lý khi nhấn xác nhận: gọi callback onConfirm và đóng modal
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      transparent={true}          // hiển thị nền mờ phía sau
      visible={visible}           // điều khiển hiển thị modal
      animationType="fade"        // hiệu ứng xuất hiện
      onRequestClose={onClose}    // callback khi modal bị đóng (Android)
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

// Style cho modal
const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', // nền mờ
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: SIZES.padding 
  },
  modalContent: { 
    width: '100%', 
    backgroundColor: COLORS.white, 
    borderRadius: SIZES.radius * 1.5, 
    padding: SIZES.padding, 
    elevation: 10 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.textDark, 
    marginBottom: SIZES.padding / 2, 
    textAlign: 'center' 
  },
  message: { 
    fontSize: 16, 
    color: COLORS.textLight, 
    textAlign: 'center', 
    marginBottom: SIZES.padding * 1.5, 
    lineHeight: 24 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 10 // khoảng cách giữa 2 nút
  },
  button: { 
    flex: 1, 
    padding: 14, 
    borderRadius: SIZES.radius, 
    alignItems: 'center' 
  },
  cancelButton: { backgroundColor: COLORS.lightGray },
  confirmButton: { backgroundColor: COLORS.primary },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  cancelButtonText: { color: COLORS.textDark },
  confirmButtonText: { color: COLORS.white },
});

export default ConfirmationModal;
