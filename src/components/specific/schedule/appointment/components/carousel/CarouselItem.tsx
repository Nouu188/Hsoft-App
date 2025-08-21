import { AppointmentCardData } from '@/constants/mockData';
import { COLORS, SIZES } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import dayjs from 'dayjs';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { ITEM_WIDTH, SNAP_INTERVAL } from '../../carouselConfig';
import { useCarouselCardAnimation } from '../../hooks/useCarouselCardAnimation';

const ITEM_HEIGHT = 420;

interface CarouselItemProps {
  scrollX: SharedValue<number>;
  index: number;
  total: number;
  item: AppointmentCardData;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ item, scrollX, index }) => {
  const step = SNAP_INTERVAL;
  const { cardStyle, textStyle, imageStyle } = useCarouselCardAnimation(scrollX, index, step);

  return (
    <Animated.View style={[styles.cardContainer, { marginVertical: 10 }, cardStyle]}>
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
    height: ITEM_HEIGHT - 250,
    overflow: 'hidden',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imageBackgroundStyle: { width: '100%', height: '100%', resizeMode: 'cover', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  textContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SIZES.padding },
  doctorName: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  specialty: { fontSize: 16, color: COLORS.white, opacity: 0.9, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { fontSize: 14, color: COLORS.white, marginLeft: 8 },
});

export default CarouselItem;