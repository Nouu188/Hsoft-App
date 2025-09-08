import React, { useRef, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Dimensions, 
  ViewabilityConfig,
} from 'react-native';
import { CarouselProps } from './types';
import { useCarousel } from './hooks/useCarousel';
import Pagination from './components/Pagination';
import { useThemeStore } from '@/store/useThemeStore'; // 👈 import store

const { width: screenWidth } = Dimensions.get('window');

const NewsCarouselView = <T extends { id: string | number }>({
  data,
  renderItem,
  autoplay = true,
  autoplayInterval = 5000,
  showPagination = true,
}: CarouselProps<T>) => {
  
  const { theme } = useThemeStore(); // lấy theme hiện tại

  const {
    activeIndex,
    flatListRef,
    onViewableItemsChanged,
    handleScrollBeginDrag,
    handleScrollEndDrag,
  } = useCarousel({ data, autoplay, autoplayInterval });

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
  }).current;
  
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  }), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}                
        data={data}                     
        renderItem={({ item }) => (      
          <View style={[styles.itemContainer, { backgroundColor: theme.background }]}>
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

      {showPagination && data.length > 1 && (
        <Pagination dataLength={data.length} activeIndex={activeIndex} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
  },
  itemContainer: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});

export default NewsCarouselView;
