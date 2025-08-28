import React, { useRef, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Dimensions, 
  ViewabilityConfig,
} from 'react-native';
import { CarouselProps } from './types';           // Props định nghĩa cho Carousel
import { useCarousel } from './hooks/useCarousel'; // Hook quản lý logic carousel (autoplay, activeIndex, ...)
import Pagination from './components/Pagination';  // Component hiển thị dấu chấm (dots)

const { width: screenWidth } = Dimensions.get('window'); // Lấy chiều rộng màn hình để tính kích thước slide

// Component Carousel (tái sử dụng cho mọi loại data, generic T)
const NewsCarouselView = <T extends { id: string | number }>({
  data,
  renderItem,
  autoplay = true,           // mặc định tự động chạy
  autoplayInterval = 5000,   // mặc định 5 giây
  showPagination = true,     // mặc định có hiển thị dots
}: CarouselProps<T>) => {
  
  // Gọi custom hook để lấy state & handlers cần thiết
  const {
    activeIndex,             // index hiện tại
    flatListRef,             // ref để điều khiển FlatList
    onViewableItemsChanged,  // callback cập nhật index khi scroll
    handleScrollBeginDrag,   // dừng autoplay khi user kéo tay
    handleScrollEndDrag,     // bật lại autoplay khi thả
  } = useCarousel({ data, autoplay, autoplayInterval });

  // Cấu hình: 1 item được coi là "visible" nếu >=50% diện tích hiển thị
  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
  }).current;
  
  // Tối ưu hiệu năng FlatList khi scrollToIndex
  // Giúp RN biết trước kích thước mỗi item để tính toán offset nhanh hơn
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: screenWidth,        // chiều rộng mỗi slide = chiều rộng màn hình
    offset: screenWidth * index,// vị trí offset của slide
    index,
  }), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}                
        data={data}                     
        renderItem={({ item }) => (      
          <View style={styles.itemContainer}>
            {renderItem(item)}           
          </View>
        )}
        keyExtractor={(item) => String(item.id)} 
        horizontal                         
        pagingEnabled                     
        showsHorizontalScrollIndicator={false} 
        onViewableItemsChanged={onViewableItemsChanged} 
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        onScrollBeginDrag={handleScrollBeginDrag} 
        onScrollEndDrag={handleScrollEndDrag}     
      />

      {/* Hiển thị dots pagination nếu có nhiều hơn 1 item */}
      {showPagination && data.length > 1 && (
        <Pagination dataLength={data.length} activeIndex={activeIndex} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,        // chiều cao carousel
    width: '100%',      // full chiều rộng màn hình
  },
  itemContainer: {
    width: screenWidth, // mỗi item = 1 trang ngang
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});

export default NewsCarouselView;
