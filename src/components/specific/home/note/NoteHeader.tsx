import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { HeaderProps } from './types';

const Header: React.FC<HeaderProps> = ({ onBackPress, onSettingsPress }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Ghi chú</Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.padding, 
    marginTop: SIZES.padding * 2 
  },
  backButton: { 
    width: 44, height: 44, borderRadius: 22, 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1, borderColor: COLORS.border, 
    backgroundColor: COLORS.white 
  },
  titleContainer: { 
    position: 'absolute', 
    left: 0, right: 0, 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: SIZES.h3, 
    fontWeight: 'bold', 
    color: COLORS.text 
  },
  headerActions: { flexDirection: 'row' },
  iconButton: { marginLeft: 20 },
});

export default Header;
