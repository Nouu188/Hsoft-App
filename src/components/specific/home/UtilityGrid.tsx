import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons'; // Hoặc thư viện icon bạn dùng
import { SIZES, COLORS } from '@/constants/theme'; // Import theme của bạn

// Lấy kiểu dữ liệu chính xác cho tên icon từ chính component Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
// Định nghĩa kiểu dữ liệu cho mỗi mục tiện ích
export interface UtilityItemProps {
  id: string;
  name: string;
  iconName: IoniconsName; // Tên icon từ thư viện Ionicons
  backgroundColor: string; // Màu nền của icon
  iconColor?: string; // Màu của icon, mặc định là trắng
  onPress: () => void;
}

// Props cho component chính
interface UtilityGridProps {
  title: string;
  services: UtilityItemProps[];
  numColumns?: number;
}

// Lấy chiều rộng màn hình để tính toán kích thước item
const { width } = Dimensions.get('window');
const NUM_COLUMNS_DEFAULT = 4;
const PADDING_HORIZONTAL = SIZES.padding;

const UtilityGrid: React.FC<UtilityGridProps> = ({ title, services, numColumns = NUM_COLUMNS_DEFAULT }) => {
  
  // Tính toán kích thước cho mỗi item để chúng vừa vặn trên màn hình
  const itemSize = (width - PADDING_HORIZONTAL * 2) / numColumns;

  const renderItem = ({ item }: { item: UtilityItemProps }) => (
    <TouchableOpacity onPress={item.onPress} style={[styles.itemContainer, { width: itemSize }]}>
      <View style={[styles.iconWrapper, { backgroundColor: item.backgroundColor }]}>
        <Ionicons name={item.iconName} size={28} color={item.iconColor || COLORS.white} />
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        scrollEnabled={false} // Tắt cuộn nếu lưới này nằm trong một ScrollView khác
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING_HORIZONTAL,
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
  itemContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.5,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18, // Bo góc vừa phải để tạo cảm giác thân thiện
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  itemName: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    // Cho phép tên có thể xuống 2 dòng
    height: 30, // Chiều cao cố định để căn chỉnh
  },
});

export default UtilityGrid;