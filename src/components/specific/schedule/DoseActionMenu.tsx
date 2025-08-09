import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';

interface MenuOption {
  label: string;
  icon: keyof typeof Ionicons;
  onPress: () => void;
  isDestructive?: boolean;
}

interface DoseActionMenuProps {
  visible: boolean;
  onClose: () => void;
  options: MenuOption[];
}

const DoseActionMenu: React.FC<DoseActionMenuProps> = ({ visible, onClose, options }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.menuContainer}>
            {options.map((opt, index) => (
              <TouchableOpacity key={index} style={styles.option} onPress={() => { opt.onPress(); onClose(); }}>
                <Ionicons name={opt.icon as any} size={22} color={opt.isDestructive ? COLORS.danger : COLORS.textDark} />
                <Text style={[styles.optionText, opt.isDestructive && { color: COLORS.danger }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SIZES.padding },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  optionText: { fontSize: 16, marginLeft: 15, color: COLORS.textDark },
});

export default DoseActionMenu;