import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SIZES, COLORS } from '@/constants/theme';
import { UtilityGridProps, UtilityItemProps } from './types'; 
import { useGridCalculations } from './hooks/useUtilityCalculations'; // custom hook tính toán
import GridItem from './components/UtilityItem'; // component hiển thị từng ô trong lưới

// Số cột mặc định cho lưới
const NUM_COLUMNS_DEFAULT = 4;

// Component UtilitiesView hiển thị một danh sách các tiện ích (services) dạng lưới
const UtilitiesView: React.FC<UtilityGridProps> = ({ title, services, numColumns = NUM_COLUMNS_DEFAULT }) => {
  // Gọi custom hook để tính toán kích thước item dựa trên số cột
  const { itemSize } = useGridCalculations(numColumns);

  // Hàm renderItem cho FlatList
  // useCallback được dùng để tránh tạo lại hàm mới khi không cần thiết
  const renderItem = useCallback(
    ({ item }: { item: UtilityItemProps }) => (
      <GridItem item={item} itemSize={itemSize} />
    ),
    [itemSize] // chỉ re-create khi itemSize thay đổi
  );

  return (
    <View style={styles.container}>
      {/* Tiêu đề của nhóm tiện ích */}
      <Text style={styles.title}>{title}</Text>

      {/* Danh sách tiện ích dạng lưới */}
      <FlatList
        data={services}                // dữ liệu các tiện ích
        renderItem={renderItem}        // cách render từng item
        keyExtractor={(item) => item.id} // key duy nhất cho mỗi item
        numColumns={numColumns}        // số cột của lưới
        scrollEnabled={false}          // không cho scroll riêng (để scroll ngoài bao trọn)
        columnWrapperStyle={styles.row} // style cho mỗi hàng
      />
    </View>
  );
};

// Style cho component
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.padding, // lề ngang
    paddingTop: SIZES.padding,        // lề trên
    paddingBottom: SIZES.base,        // lề dưới
  },
  title: {
    fontSize: 18,                     // cỡ chữ tiêu đề
    fontWeight: 'bold',               // in đậm
    color: COLORS.textDark,           // màu chữ từ theme
    marginBottom: SIZES.padding * 0.75, // khoảng cách dưới tiêu đề
  },
  row: {
    justifyContent: 'flex-start',     // các item căn từ trái sang
  },
});

export default UtilitiesView;
