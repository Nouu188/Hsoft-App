import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { StatCardProps } from './types'; 

// Component hiển thị 1 thẻ thống kê
const StatCard: React.FC<StatCardProps> = ({ stat }) => (
    <View style={styles.statCard}>
        {/* Hàng đầu: giá trị + icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Giá trị chính */}
            <Text style={styles.statValue}>{stat.value}</Text>

            {/* Icon checkmark nếu stat.hasIcon = true */}
            {stat.hasIcon && (
                <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
            )}
        </View>

        {/* Nhãn thống kê */}
        <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
);

const styles = StyleSheet.create({
    statCard: {
        backgroundColor: '#FFFFFF',       // nền trắng
        borderRadius: 16,                 // bo góc
        padding: 16,                       // padding trong thẻ
        width: '48%',                      // chiếm khoảng nửa chiều ngang (dễ dùng grid 2 cột)
        // Shadow cho iOS
        shadowColor: '#9FB1C6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Shadow cho Android
        elevation: 5,
    },
    statValue: {
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#1E293B',                 // màu chữ tối
    },
    statLabel: {
        fontSize: 14, 
        color: '#64748B',                  // màu chữ nhạt
        marginTop: 8,                       // cách trên
    },
    checkIcon: {
        width: 24, 
        height: 24, 
        borderRadius: 12, 
        backgroundColor: '#34D399',        // màu xanh
        justifyContent: 'center', 
        alignItems: 'center', 
        marginLeft: 8,                      // cách giá trị stat
    },
});

export default StatCard;
