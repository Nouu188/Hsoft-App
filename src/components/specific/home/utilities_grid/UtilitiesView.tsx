import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SIZES } from '@/constants/theme';
import { UtilityGridProps, UtilityItemProps } from './types'; 
import { useGridCalculations } from './hooks/useUtilityCalculations';
import GridItem from './components/UtilityItem';
import { useThemeStore } from '@/store/useThemeStore'; // 👈 import store

const NUM_COLUMNS_DEFAULT = 4;

const UtilitiesView: React.FC<UtilityGridProps> = ({ title, services, numColumns = NUM_COLUMNS_DEFAULT }) => {
  const { theme } = useThemeStore(); // lấy theme hiện tại
  const { itemSize } = useGridCalculations(numColumns);

  const renderItem = useCallback(
    ({ item }: { item: UtilityItemProps }) => (
      <GridItem item={item} itemSize={itemSize} />
    ),
    [itemSize]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textDark }]}>{title}</Text>

      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.padding * 0.75,
  },
  row: {
    justifyContent: 'flex-start',
  },
});

export default UtilitiesView;
