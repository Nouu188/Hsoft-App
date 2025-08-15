// src/screens/schedule/medication/components/SwipeableCard.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  // NativeSyntheticEvent, NativeScrollEvent không còn cần thiết
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedRef,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Cấu hình kích thước (bạn có thể điều chỉnh nếu muốn)
const ITEM_WIDTH = SCREEN_WIDTH * 0.72;
const ITEM_HEIGHT = ITEM_WIDTH * 1.4;
const SPACING = 10;
const SNAP_INTERVAL = ITEM_WIDTH + SPACING;
const PADDING_HORIZONTAL = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

interface SwipeableCardProps {
  // dữ liệu tối thiểu cần có id để làm key
  data: Array<{ id: string | number } & Record<string, any>>;
  // renderItem phải nhận { item }
  renderItem: (props: { item: any }) => React.ReactElement;
  // tuỳ chọn: override width (không bắt buộc)
  itemWidth?: number;
}

const SwipeableCard = ({ data, renderItem }: SwipeableCardProps): React.ReactElement => {
  const scrollX = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // <<< PHẦN NÀY ĐÃ ĐƯỢC XÓA BỎ HOÀN TOÀN >>>
  // const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //   const x = event.nativeEvent.contentOffset.x;
  //   const closestIndex = Math.round(x / SNAP_INTERVAL);
  //   const snapToX = closestIndex * SNAP_INTERVAL;
  //   scrollRef.current?.scrollTo({ x: snapToX, animated: true });
  // };

  return (
    <View style={[styles.container, { height: ITEM_HEIGHT }]}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}

        // <<< THAY ĐỔI QUAN TRỌNG NHẤT NẰM Ở ĐÂY >>>
        // Sử dụng các thuộc tính tích hợp để snapping chính xác hơn
        snapToInterval={SNAP_INTERVAL}
        disableIntervalMomentum={true}
        
        // Các props sau đã được xóa bỏ vì chúng gây ra lỗi
        // onMomentumScrollEnd={handleMomentumScrollEnd}
        // onScrollEndDrag={handleMomentumScrollEnd}
        
        contentContainerStyle={{ paddingHorizontal: PADDING_HORIZONTAL - SPACING / 2 }}
      >
        {data.map((item, index) => {
          const inputRange = [
            (index - 1) * SNAP_INTERVAL,
            index * SNAP_INTERVAL,
            (index + 1) * SNAP_INTERVAL,
          ];

          const animatedCardStyle = useAnimatedStyle(() => {
            const rotateY = interpolate(scrollX.value, inputRange, [25, 0, -25], 'clamp');
            const scale = interpolate(scrollX.value, inputRange, [0.95, 1, 0.95], 'clamp');
            return {
              transform: [
                { perspective: ITEM_WIDTH * 4 },
                { rotateY: `${rotateY}deg` },
                { scale },
              ],
            };
          });

          return (
            <View key={String(item.id)} style={styles.itemContainer}>
              <Animated.View style={[styles.card, animatedCardStyle]}>
                {renderItem({ item })}
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

export default SwipeableCard;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginHorizontal: SPACING / 2,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    backgroundColor: '#fff',
  },
});