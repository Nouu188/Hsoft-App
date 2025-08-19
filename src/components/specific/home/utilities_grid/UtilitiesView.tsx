import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import { UtilityGridProps, UtilityItemProps } from './types';
import { useGridCalculations } from './hooks/useUtilityCalculations';
import GridItem from './components/UtilityItem';

const NUM_COLUMNS_DEFAULT = 4;

const UtilitiesView: React.FC<UtilityGridProps> = ({ title, services, numColumns = NUM_COLUMNS_DEFAULT }) => {
  // Gọi custom hook để lấy logic tính toán
  const { itemSize } = useGridCalculations(numColumns);

  // Dùng useCallback để tối ưu hóa việc render item của FlatList
  const renderItem = useCallback(
    ({ item }: { item: UtilityItemProps }) => <GridItem item={item} itemSize={itemSize} />,
    [itemSize] // Chỉ tạo lại hàm renderItem khi itemSize thay đổi
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
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
    color: COLORS.textDark,
    marginBottom: SIZES.padding * 0.75,
  },
  row: {
    justifyContent: 'flex-start',
  },
});

export default UtilitiesView;