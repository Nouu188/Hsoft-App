import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList, SafeAreaView, ListRenderItemInfo, useWindowDimensions } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';
import { useScheduleStore } from '@/store/useScheduleStore';
import dayjs from 'dayjs';
import HealthCardsView from '../components/specific/home/healthcards/HeartStatView';
import NextScheduleView from '@/components/specific/home/next_schedule/components/ScheduleItem';
import NoScheduleView from '@/components/specific/home/next_schedule/components/NoScheduleItem';
import UtilitiesView from '../components/specific/home/utilities_grid/UtilitiesView';
import { UtilityItemProps } from '../components/specific/home/utilities_grid/types';
import NewsCarouselView from '../components/specific/home/news_carousel/NewsCarouselView';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

// --- DỮ LIỆU MẪU & COMPONENT PHỤ ---
// Việc đặt các phần này ở ngoài giúp tránh việc phải tạo lại chúng mỗi khi component re-render.

const carouselData = [
  { id: '1', title: 'Mẹo 1: Uống đủ nước', content: 'Hãy đảm bảo bạn uống ít nhất 2 lít nước mỗi ngày để cơ thể luôn khỏe mạnh.' },
  { id: '2', title: 'Mẹo 2: Ngủ đủ giấc', content: 'Một giấc ngủ 7-8 tiếng sẽ giúp bạn phục hồi năng lượng và tinh thần sảng khoái.' },
  { id: '3', title: 'Mẹo 3: Vận động nhẹ nhàng', content: 'Đi bộ 30 phút mỗi ngày giúp cải thiện sức khỏe tim mạch và giảm căng thẳng.' },
];

const healthServices: UtilityItemProps[] = [
    { id: '1', name: 'Thêm Lịch thuốc', iconName: 'medkit-outline', onPress: () => console.log('Thêm Lịch uống thuốc') },
    { id: '2', name: 'Ghi chú', iconName: 'document-text-outline', onPress: () => console.log('Ghi chú Sức khỏe') },
    { id: '3', name: 'Giấc ngủ', iconName: 'moon-outline', onPress: () => console.log('Theo dõi Giấc ngủ') },
    { id: '4', name: 'Uống nước', iconName: 'water-outline', onPress: () => console.log('Uống nước') },
    { id: '5', name: 'Bữa ăn', iconName: 'restaurant-outline', onPress: () => console.log('Thêm Bữa ăn') },
    { id: '6', name: 'Bài tập Thở', iconName: 'leaf-outline', onPress: () => console.log('Bài tập Thở') },
    { id: '7', name: 'Nhịp tim', iconName: 'heart-outline', onPress: () => console.log('Đo nhịp tim') },
    { id: '8', name: 'Xem thêm', iconName: 'apps-outline', onPress: () => console.log('Xem thêm') },
];

const TipCard = ({ title, content }: { title: string, content: string }) => (
  <View style={styles.tipCardContainer}>
    <Text style={styles.tipCardTitle}>{title}</Text>
    <Text style={styles.tipCardContent}>{content}</Text>
  </View>
);

// --- CÁC HẰNG SỐ CHO ANIMATION ---
const GREETING_SECTION_HEIGHT = 110;
const STICKY_SECTION_HEIGHT = 200;
const HEADER_MAX_HEIGHT = GREETING_SECTION_HEIGHT + STICKY_SECTION_HEIGHT;
const HEADER_SCROLL_DISTANCE = GREETING_SECTION_HEIGHT;

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface ScreenSection {
  type: 'medical_text' | 'carousel_tips' | 'utility_grid' | 'footer_spacer';
  id: string;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ScreenSection>);

// --- COMPONENT CHÍNH ---
const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const isLoading = useScheduleStore(state => state.isLoading);
  const onRefresh = () => console.log("Refreshing...");
  const { height: screenHeight } = useWindowDimensions(); // Giữ lại hook này vì nó được dùng trong style
  const scrollY = useSharedValue(0);

  // --- ANIMATION LOGIC ---
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    // Di chuyển toàn bộ khối header lên trên một khoảng bằng chiều cao của phần "Chào buổi sáng".
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -HEADER_SCROLL_DISTANCE],
      Extrapolation.CLAMP 
    );
    return { transform: [{ translateY }] };
  });

  const fadeOutAnimatedStyle = useAnimatedStyle(() => {
    // Làm mờ dần phần "Chào buổi sáng" khi cuộn.
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // --- DANH SÁCH CÁC PHẦN TỬ TRONG FLATLIST ---
  const screenSections: ScreenSection[] = [
    { type: 'medical_text', id: 'medical_text' },
    { type: 'carousel_tips', id: 'carousel_tips' },
    { type: 'utility_grid', id: 'utility_grid' },
    { type: 'footer_spacer', id: 'footer_spacer' },
  ];
  
  const renderSection = ({ item }: ListRenderItemInfo<ScreenSection>) => {
    switch (item.type) {
      case 'medical_text':
        // Giữ nguyên logic và style gốc của bạn
        return ( 
            <View style={{ marginTop: HEADER_MAX_HEIGHT-320 }}>
                <HealthCardsView/>
            </View>
        );
      case 'carousel_tips':
        return <NewsCarouselView data={carouselData} renderItem={(tip) => <TipCard title={tip.title} content={tip.content} />}/>;
      case 'utility_grid':
        return <UtilitiesView title="Tiện ích sức khỏe" services={healthServices} />;
      case 'footer_spacer':
        return <View style={{ height: 100 }} />;
      default:
        return null;
    }
  };

  // --- RENDER COMPONENT ---
  return (
    <View style={styles.container}>
      <AnimatedFlatList
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        data={screenSections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            progressViewOffset={HEADER_MAX_HEIGHT}
            tintColor={COLORS.white}
          />
        }
      />
      
      {/* Header động nằm bên ngoài FlatList */}
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <SafeAreaView style={{ flex: 1,marginTop:40 }}>
            {/* Phần sẽ cuộn đi */}
            <Animated.View style={[styles.greetingSection, fadeOutAnimatedStyle]}>
                <Text style={styles.greeting}>Chào buổi sáng{'\n'}<Text style={styles.userName}>Thịnh</Text></Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.notificationButton}><Ionicons name="search-outline" size={23} color={COLORS.white} /></TouchableOpacity>
                    <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notification')}><Ionicons name="notifications-outline" size={23} color={COLORS.white} /></TouchableOpacity>
                </View>
            </Animated.View>

            {/* Phần sẽ ghim lại */}
            <View style={styles.stickySection}>
                <View style={styles.titleContainer}>
                    <Text style={styles.sectionTitle}>Lịch của bạn</Text>
                    <Text style={styles.monthTitle}>Ngày {dayjs().date()} Tháng {dayjs().month() + 1}</Text>
                </View>
                <View style={styles.tipContainer}>
                    <Text style={styles.tipTitle}>Gợi ý cho bạn</Text>
                </View>
                <NextScheduleView
                    iconName="medkit-outline"
                    iconBgColor="#E9F7FE"
                    title={`Uống 1 viên Panadol Extra`}
                    subtitle={`Vào lúc 14:00 hôm nay`}
                    onPress={() => {}}
                />
            </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

// --- STYLES ---
// Giữ nguyên 100% style của bạn
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffffff' 
  },
  tipCardContainer: { 
    width: '100%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    height: 180, 
    justifyContent: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 
  },
  tipCardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  tipCardContent: { 
    fontSize: 14, 
    color: '#666' 
  },
  headerContainer: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, 
    zIndex: 10, 
    backgroundColor: COLORS.primary, 
    height: HEADER_MAX_HEIGHT-20, 
    overflow: 'hidden', 
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, },
  greetingSection: { 
    height: GREETING_SECTION_HEIGHT, 
    paddingHorizontal: SIZES.padding, flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 10 },
  stickySection: { 
    height: STICKY_SECTION_HEIGHT-60, 
    justifyContent: 'center' 
  }, // Giữ nguyên style này
  greeting: { 
    fontSize: 20, fontWeight: '500', color: COLORS.white 
  },
  userName: { 
    fontSize: 22, fontWeight: '700', color: COLORS.white 
  },
  notificationButton: { 
    width: 40, height: 40, borderRadius: 22, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  titleContainer: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', paddingHorizontal: SIZES.padding 
  },
  sectionTitle: { 
    fontSize: 23, fontWeight: 'bold', color: COLORS.textDark 
  },
  monthTitle: { 
    fontSize: 16, fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' 
  },
  tipContainer: { 
    paddingHorizontal: SIZES.padding, marginTop: SIZES.base ,marginBottom: SIZES.base,
  },
  tipTitle: { 
    fontSize: 16, fontWeight: 'bold', color: COLORS.textDark 
  },
});

export default HomeScreen;