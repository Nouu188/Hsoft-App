// src/constants/theme.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// --- BẢNG MÀU (COLOR PALETTE) ---
// Dựa trên màu chủ đạo #5A8D9E và các màu phụ trợ từ thiết kế.
export const COLORS = {
  // Màu chủ đạo
  primary: '#B6CAE5', // Màu xanh xám chính, dùng cho các nút active, icon, điểm nhấn
  primaryLight: '#E8EDF3', // Một phiên bản rất nhạt của màu primary, dùng cho nền card
  
  // Màu phụ trợ
  secondary: '#475569', // Màu xám đậm cho các yếu tố phụ
  accent: '#F76F6F',   // Màu nhấn (đỏ/hồng san hô) cho các chỉ số quan trọng, cảnh báo

  // Màu trạng thái
  success: '#27AE60',  // Xanh lá cây cho hành động thành công
  warning: '#F39C12',  // Vàng cho cảnh báo
  danger: '#C0392B',   // Đỏ cho lỗi hoặc hành động xóa

  // Màu văn bản (Text)
  textDark: '#3A5C94',  // Gần như đen, cho tiêu đề và văn bản chính
  text: '#34495E',      // Xám đậm cho văn bản phụ
  textLight: '#7192B4', // Xám nhạt cho các ghi chú, placeholder
  textOnPrimary: '#FFFFFF', // Màu chữ trên nền màu chủ đạo

  // Màu nền (Background)
  background: '#F8FAFC', // Màu nền chính của app (trắng hơi xám)
  white: '#FFFFFF',      // Màu trắng tinh khiết cho các card
  lightGray: '#F1F5F9',  // Xám rất nhạt cho các dải phân cách, nền input
  border: '#D8DEE9',     // Màu viền

  placeholderColor:'#b3b0b0ff', //màu của placeholder
  introduction:'#4ca9beff',//màu cho giao diện đăng nhập(đậm hơn so với màu nền app)
  // Màu trong suốt
  transparent: 'transparent',
};

// --- KÍCH THƯỚC (SIZING & SPACING) ---
// Sử dụng một hệ thống khoảng cách dựa trên bội số của 8 (8-point grid system)
export const SIZES = {
  // Kích thước cơ bản
  base: 8,
  font: 14,
  radius: 12,
  padding: 20, // Padding chính cho các container

  // Kích thước phông chữ
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // Kích thước màn hình
  width,
  height,
};

// --- PHÔNG CHỮ (TYPOGRAPHY) ---
// Định nghĩa các kiểu phông chữ dùng chung.
// Bạn có thể cần cài đặt các phông chữ này vào dự án (ví dụ: Inter, Poppins, Nunito Sans)
export const FONTS = {
  h1: { fontFamily: 'System', fontSize: SIZES.h1, lineHeight: 36, fontWeight: 'bold' as const, color: COLORS.textDark },
  h2: { fontFamily: 'System', fontSize: SIZES.h2, lineHeight: 30, fontWeight: 'bold' as const, color: COLORS.textDark },
  h3: { fontFamily: 'System', fontSize: SIZES.h3, lineHeight: 22, fontWeight: 'bold' as const, color: COLORS.textDark },
  h4: { fontFamily: 'System', fontSize: SIZES.h4, lineHeight: 22, fontWeight: 'bold' as const, color: COLORS.textDark },
  body1: { fontFamily: 'System', fontSize: SIZES.body1, lineHeight: 36, fontWeight: 'normal' as const, color: COLORS.text },
  body2: { fontFamily: 'System', fontSize: SIZES.body2, lineHeight: 30, fontWeight: 'normal' as const, color: COLORS.text },
  body3: { fontFamily: 'System', fontSize: SIZES.body3, lineHeight: 22, fontWeight: 'normal' as const, color: COLORS.text },
  body4: { fontFamily: 'System', fontSize: SIZES.body4, lineHeight: 22, fontWeight: 'normal' as const, color: COLORS.text },
  body5: { fontFamily: 'System', fontSize: SIZES.body5, lineHeight: 22, fontWeight: 'normal' as const, color: COLORS.textLight },
};

// --- HIỆU ỨNG BÓNG ĐỔ (SHADOWS) ---
// Định nghĩa các kiểu bóng đổ để tái sử dụng
export const SHADOWS = {
  light: {
    shadowColor: COLORS.textDark,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.textDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};

const appTheme = { COLORS, SIZES, FONTS, SHADOWS };

export default appTheme;