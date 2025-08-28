import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import type { SearchBarProps } from './types';

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, onFilterPress, activeFilterCount }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={22} color={COLORS.textLight} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm thuốc..."
        placeholderTextColor={COLORS.textLight}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
        <Ionicons name="options-outline" size={24} color={COLORS.textDark} />
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2f9', 
    borderRadius: 30,
    paddingHorizontal: SIZES.padding,
    marginHorizontal: SIZES.padding * 0.5,
    height: 52,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    height: '100%',
  },
  filterButton: {
    paddingLeft: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default SearchBar;