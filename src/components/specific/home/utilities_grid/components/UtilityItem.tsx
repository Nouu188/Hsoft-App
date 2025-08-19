import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SIZES, COLORS } from '@/constants/theme';
import { UtilityItemProps } from '../types';

interface GridItemComponentProps {
  item: UtilityItemProps;
  itemSize: number;
}

const GridItem: React.FC<GridItemComponentProps> = React.memo(({ item, itemSize }) => {
  return (
    <TouchableOpacity onPress={item.onPress} style={[styles.itemContainer, { width: itemSize }]}>
      <View style={[styles.iconWrapper, { backgroundColor: COLORS.primary }]}>
        <Ionicons name={item.iconName} size={28} color={item.iconColor || COLORS.white} />
      </View>
      <Text style={styles.itemName} numberOfLines={2}>
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
    color: COLORS.text,
    textAlign: 'center',
    // Đảm bảo chiều cao nhất quán để căn chỉnh
    height: 30, 
  },
});

export default GridItem;