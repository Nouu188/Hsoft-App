import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, FlatList } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';

type IoniconName = keyof typeof Ionicons;

export interface MenuOption {
  label: string;
  icon: IoniconName;
  onPress: () => void;
  isDestructive?: boolean;
}

interface DoseActionMenuProps {
  visible: boolean;
  onClose: () => void;
  options: MenuOption[];
  title?: string; 
}

const DoseActionMenu: React.FC<DoseActionMenuProps> = ({ visible, onClose, options, title }) => {
    const renderOption = ({ item }: { item: MenuOption }) => {
    const color = item.isDestructive ? COLORS.danger : COLORS.textDark;

    return (
      <TouchableOpacity 
        style={styles.option} 
        onPress={() => {
          item.onPress();
          onClose();
        }}
      >
        <Ionicons name={item.icon as any} size={24} color={color} />
        <Text style={[styles.optionText, { color }]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>{title || 'Tùy chọn'}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={options}
                renderItem={renderOption}
                keyExtractor={(item) => item.label}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end', 
  },
  menuContainer: { 
    backgroundColor: COLORS.white, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 1.5, 
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  closeButton: {
    padding: 4,
  },
  option: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16 
  },
  optionText: { 
    fontSize: 16, 
    marginLeft: 16, 
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 41, // Căn lề với text
  },
});

export default DoseActionMenu;