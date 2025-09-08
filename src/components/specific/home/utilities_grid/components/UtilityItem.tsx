import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons'; 
import { SIZES,COLORS } from '@/constants/theme';       
import { GridItemProps } from '../types';
import { useThemeStore } from '@/store/useThemeStore'; // 👈 import store

const GridItem: React.FC<GridItemProps> = React.memo(({ item, itemSize }) => {
  const { theme } = useThemeStore(); // lấy theme hiện tại

  return (
    <TouchableOpacity
      onPress={item.onPress}
      style={[styles.itemContainer, { width: itemSize }]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.primary }]}>
        <Ionicons
          name={item.iconName}
          size={28}
          color={COLORS.white} 
        />
      </View>

      <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.5,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  itemName: {
    fontSize: 12,
    textAlign: 'center',
    height: 30,
  },
});

export default GridItem;
