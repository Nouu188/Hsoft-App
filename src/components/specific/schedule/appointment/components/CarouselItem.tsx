import { StyleSheet, Dimensions, Text, ImageBackground, View } from 'react-native';
import React from 'react';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { AppointmentCardData } from '@/constants/mockData';
import dayjs from 'dayjs';

const OFFSET = 45;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
const ITEM_HEIGHT = 420;

interface CarouselItemProps {
  scrollX: SharedValue<number>;
  index: number;
  total: number;
  item: AppointmentCardData;
};

const CarouselItem: React.FC<CarouselItemProps> = ({ item, scrollX, index, total }) => {
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  // --- LOGIC ANIMATION GIỮ NGUYÊN ---
  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.85, 0.92, 0.85], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  const imageStyle = useAnimatedStyle(() => {
    const translateX = interpolate(scrollX.value, inputRange, [-ITEM_WIDTH * 0.02, 0, ITEM_WIDTH * 0.02], Extrapolation.CLAMP);
    return { transform: [{ translateX }] };
  });

  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [35, 0, 35], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          marginLeft: index === 0 ? OFFSET : undefined,
          marginRight: index === total - 1 ? OFFSET : undefined,
        },
        cardStyle,
      ]}
    >
      <Animated.View style={[{ width: ITEM_WIDTH, height: ITEM_HEIGHT, overflow: 'hidden' }, imageStyle]}>
        <ImageBackground
          source={{ uri: item.image, cache: 'force-cache' }}
          style={styles.imageBackgroundStyle}
          resizeMethod="resize"
        >
          <View style={styles.overlay} pointerEvents="none" />
          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.doctorName}>{item.doctorName}</Text>
            <Text style={styles.specialty}>{item.specialty}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text style={styles.infoText}>{dayjs(item.date).format('dddd, DD/MM/YYYY')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={styles.infoText}>{item.time}</Text>
            </View>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    overflow: 'hidden',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imageBackgroundStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  specialty: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default CarouselItem;