import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '@/constants/theme';

// Component Header hiển thị thanh trên cùng với nút quay lại và tiêu đề
const Header = () => {
    const navigation = useNavigation(); // Hook navigation

    return (
        <View style={styles.headerContainer}>
            {/* Nút quay lại */}
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()} // Quay về màn hình trước
            >
                <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Tiêu đề căn giữa */}
            <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>Thống kê uống thuốc</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
        position: 'absolute', // đặt tiêu đề ở giữa
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.h2,   // kích thước tiêu đề
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerContainer: {
        flexDirection: 'row',           // bố cục ngang
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SIZES.padding,       // khoảng cách trên
    },
    backButton: {
        width: 44, 
        height: 44, 
        borderRadius: 22,               // bo tròn
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border, 
        backgroundColor: COLORS.white,
        zIndex: 1,                       // để nút nằm trên các phần khác
    },
});

export default Header;
