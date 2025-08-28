import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SIZES } from '@/constants/theme';
import { GridLayoutProps } from '../types'; 
import StatCard from './StatCard';
import AddStatModal from './AddStatModal';

/**
 * GridLayout
 * 
 * Hiển thị danh sách các thống kê (StatCard) theo dạng lưới.
 * - Mỗi StatCard chiếm ~50% chiều rộng.
 * - Có thêm nút "Thêm" (AddStatModal) để thêm loại thống kê mới.
 * 
 * Props (GridLayoutProps):
 * - stats: Stat[] → danh sách các thống kê hiện tại.
 * - initialStats: Stat[] → các thống kê mặc định (không xoá được).
 * - healthProps: HealthStatsProps → dữ liệu sức khoẻ để hiển thị.
 * - onAdd: () => void → gọi khi bấm nút "Thêm".
 * - onDelete: (key: string) => void → gọi khi muốn xoá một stat (trừ stat mặc định).
 */
const GridLayout: React.FC<GridLayoutProps> = ({ stats, initialStats, healthProps, onAdd, onDelete }) => (
  <View style={styles.gridContainer}>
    {stats.map((stat) => (
      <View key={stat.key} style={styles.gridCardWrapper}>
        <StatCard
          stat={stat}
          healthProps={healthProps}
          onDelete={initialStats.some((s) => s.key === stat.key) ? undefined : onDelete}
        />
      </View>
    ))}

    <View style={styles.gridCardWrapper}>
      <AddStatModal onPress={onAdd} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',       // sắp xếp theo hàng ngang
    flexWrap: 'wrap',           // tự xuống hàng nếu hết chỗ
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  gridCardWrapper: {
    width: '48%',               // mỗi card chiếm gần nửa chiều rộng
    height: 156,
    marginBottom: SIZES.padding,
  },
});

export default GridLayout;
