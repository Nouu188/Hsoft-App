import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import type { PaginationProps } from '../types';

// Component Pagination: hiển thị các chấm (dot) để biểu thị vị trí trang/slide hiện tại
const Pagination: React.FC<PaginationProps> = React.memo(({ dataLength, activeIndex }) => {
    // Tạo mảng với độ dài bằng số lượng trang/slides (dataLength)
    const dots = Array.from({ length: dataLength });

    return (
        <View style={styles.paginationContainer}>
            {dots.map((_, index) => (
                <View
                    key={index} 
                    style={[
                        styles.paginationDot,
                        { opacity: index === activeIndex ? 1 : 0.3, borderRadius: 4 }, 
                    ]}
                />
            ))}
        </View>
    );
});

// StyleSheet cho component
const styles = StyleSheet.create({
    paginationContainer: {
        position: 'absolute',    // Cố định vị trí (thường đặt dưới cùng slider)
        bottom: 0,              // Cách mép dưới 15px
        left: 0,
        right: 0,
        flexDirection: 'row',    // Sắp xếp các dot theo hàng ngang
        justifyContent: 'center' // Canh giữa
    },
    paginationDot: {
        width: 11,                // Chiều rộng dot
        height: 11,               // Chiều cao dot
        marginHorizontal: 4,     // Khoảng cách ngang giữa các dot
        backgroundColor: COLORS.primary, // Màu dot (theo theme)
    },
});

export default Pagination;
