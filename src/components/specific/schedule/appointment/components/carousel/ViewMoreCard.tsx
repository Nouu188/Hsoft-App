import { COLORS, SIZES } from '@/constants/theme';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  SharedValue
} from 'react-native-reanimated';
import { useCarouselCardAnimation } from '../../hooks/useCarouselCardAnimation';

const OFFSET = 45;
const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
const ITEM_HEIGHT = 420;

interface ViewMoreCardProps {
  onPress: () => void;
  scrollX: SharedValue<number>;
  index: number;
}

const ViewMoreCard: React.FC<ViewMoreCardProps> = ({ onPress, scrollX, index }) => {
  const { cardStyle, contentStyle, iconStyle } = useCarouselCardAnimation(scrollX, index, ITEM_WIDTH);

  return (
    <View style={{ width: ITEM_WIDTH }}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            marginVertical: 10,
          },
          cardStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.touchableContent}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.content, contentStyle]}>
            <Animated.View style={[styles.iconWrapper, iconStyle]}>
              <Ionicons name="grid-outline" size={48} color={COLORS.primary} />
            </Animated.View>
            <Text style={styles.title}>Xem tất cả</Text>
            <Text style={styles.subtitle}>Lịch hẹn của bạn</Text>

            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: ITEM_HEIGHT-250,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  touchableContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SIZES.padding,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewMoreCard;