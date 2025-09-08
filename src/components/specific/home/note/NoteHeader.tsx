import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SIZES } from '@/constants/theme';
import { HeaderProps, ThemedHeaderProps } from './types';
import { useThemeStore } from '@/store/useThemeStore';

const Header: React.FC<ThemedHeaderProps> = ({ onBackPress, onSettingsPress, theme }) => {
  const { isDarkMode } = useThemeStore();
  return (
    <View style={styles.headerContainer}>
      {/* Back button */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.white, borderColor: theme.border }]}
        onPress={onBackPress}
        activeOpacity={0.7} // thêm hiệu ứng nhấn mềm mại
      >
        <Ionicons name="arrow-back" size={28} color={isDarkMode ? theme.textDark : theme.primary} />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.headerTitle, { color: theme.textDark }]}>Ghi chú</Text>
      </View>

      {/* Settings button */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
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
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1,
  },
  titleContainer: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: SIZES.h3, 
    fontWeight: 'bold',
  },
  headerActions: { flexDirection: 'row' },
  iconButton: { marginLeft: 20 },
});

export default Header;
