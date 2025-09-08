import { SIZES, SHADOWS } from '@/constants/theme';
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SearchBarProps, ThemedSearchBarProps } from './types';


const SearchBar: React.FC<ThemedSearchBarProps> = ({ value, onChangeText, theme }) => {
  return (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: theme.white }]}>
        <Ionicons
          name="search-outline"
          size={22}
          color={theme.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Tìm kiếm ghi chú..."
          placeholderTextColor={theme.secondary}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          underlineColorAndroid="transparent"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.base * 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    height: 50,
    ...SHADOWS.light,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body3,
  },
});

export default SearchBar;
