import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
  StyleProp,
  TextStyle,
} from 'react-native';

interface IconProps {
  name: string;
  style?: StyleProp<TextStyle>;
}

const Icon: React.FC<IconProps> = ({ name, style }) => (
  <Text style={style}>{name}</Text>
);


const NotificationSetting = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          {/* Lớp phủ mờ */}
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}>
            {/* Nội dung popup */}
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.modalOption}>
                <Icon name="✓" style={styles.modalIcon} />
                <Text style={styles.modalOptionText}>Đánh dấu đã đọc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption}>
                <Icon name="🗑️" style={styles.modalIcon} />
                <Text style={styles.modalOptionText}>Xoá thông báo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => setModalVisible(false)}>
                <Icon name="X" style={styles.modalIcon} />
                <Text style={styles.modalOptionText}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>  
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  openButton: {
    backgroundColor: '#d42a8c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- BẮT ĐẦU PHẦN STYLE CHO POPUP ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Đẩy nội dung xuống dưới cùng
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 30, // Thêm padding dưới cho an toàn
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  modalOptionText: {
fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  modalIcon: {
    fontSize: 20,
    width: 24, // Dành không gian cố định cho icon
    textAlign: 'center',
    color: '#333',
  },
  // --- KẾT THÚC PHẦN STYLE CHO POPUP ---
});

export default NotificationSetting;
