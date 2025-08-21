import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS, SIZES } from '@/constants/theme';
// 1. Import DoctorList
import DoctorList from '@/components/specific/schedule/appointment/components/doctor_list/DoctorList';

// --- CÁC HẰNG SỐ CHO ANIMATION ---
const TOP_SECTION_HEIGHT = 90;
const STICKY_SECTION_HEIGHT = SIZES.height * 0.1; // Chiều cao của phần sticky
const HEADER_MAX_HEIGHT = TOP_SECTION_HEIGHT + STICKY_SECTION_HEIGHT;
const HEADER_SCROLL_DISTANCE = TOP_SECTION_HEIGHT;

// --- COMPONENT CHÍNH ---
const DoctorSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const scrollY = useSharedValue(0);

  // --- LOGIC ANIMATION (Không đổi) ---
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -HEADER_SCROLL_DISTANCE],
      Extrapolation.CLAMP 
    );
    return { transform: [{ translateY }] };
  });

  const fadeOutAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // --- RENDER COMPONENT ---
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 2. Thêm DoctorList vào làm nội dung chính của màn hình */}
        <DoctorList
            // 3. Truyền các props cần thiết để kết nối animation
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
                // Tạo khoảng trống ở trên cùng cho header
                paddingTop: HEADER_MAX_HEIGHT*1.3,
                paddingBottom: SIZES.padding * 4, // Thêm khoảng trống dưới cùng
            }}
        />
        
        {/* Header động (Không đổi) */}
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
          <SafeAreaView style={{ flex: 1, marginTop: SIZES.padding }}>
              <Animated.View style={[styles.topSection, fadeOutAnimatedStyle]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>                  
                    <Text style={styles.titleText}>Chọn bác sĩ của bạn</Text>
                  </View>
                  <TouchableOpacity style={styles.filterButton}>
                      <Ionicons name="options-outline" size={24} color={COLORS.white} />
                  </TouchableOpacity>
              </Animated.View>

              <View style={styles.stickySection}>
                  <View style={styles.searchBarContainer}>
                      <Ionicons name="search-outline" size={22} color={COLORS.text} style={styles.searchIcon}/>
                      <TextInput
                          placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
                          style={styles.searchInput}
                          placeholderTextColor={COLORS.textLight}
                      />
                  </View>
              </View>
          </SafeAreaView>      
        </Animated.View>   
      </View>
    </GestureHandlerRootView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white,
  },
  headerContainer: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, 
    zIndex: 10, 
    backgroundColor: COLORS.primary, 
    // Sửa lại chiều cao cho chính xác
    height: HEADER_MAX_HEIGHT*1.2, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
  },
  topSection: { 
    height: TOP_SECTION_HEIGHT, 
    paddingHorizontal: SIZES.padding, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
  },
  stickySection: { 
    height: STICKY_SECTION_HEIGHT, 
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    // Sửa lại màu chữ để hiển thị trên nền xanh
    color: COLORS.white,
  },
  filterButton: { 
    width: 40, height: 40, borderRadius: 22, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.textDark,
  }
});

export default DoctorSelectionScreen;