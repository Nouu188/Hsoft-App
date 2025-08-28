import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MedicationCardProps } from './types';
import ProgressBar from './ProgressBar'; 
import { COLORS } from '@/constants/theme';

// Component hiển thị thông tin thuốc cùng tiến độ dùng thuốc
const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
    // Tính % tiến độ sử dụng thuốc
    const progress = (medication.taken / medication.total) * 100;

    return (
        <View style={styles.medCard}>
            {/* Thông tin thuốc */}
            <View style={styles.medInfo}>
                {/* Icon viên thuốc */}
                <View style={[styles.medIconContainer, { backgroundColor: medication.color }]}>
                    <View style={[styles.medIconPill, { backgroundColor: medication.iconColor }]} />
                </View>

                {/* Tên thuốc và tần suất */}
                <View>
                    <Text style={styles.medName}>{medication.name}</Text>
                    <Text style={styles.medFrequency}>{medication.frequency}</Text>
                </View>
            </View>

            {/* Progress bar hiển thị % đã dùng */}
            <ProgressBar progress={progress} color={medication.progressColor} />
        </View>
    );
};

// Style
const styles = StyleSheet.create({
    medCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        // Shadow cho iOS
        shadowColor: '#9FB1C6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Shadow cho Android
        elevation: 5,
    },
    medInfo: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 16, 
    },
    medIconContainer: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12, 
        transform: [{ rotate: '-45deg' }], // xoay icon 45 độ để tạo hiệu ứng viên thuốc
    },
    medIconPill: { 
        width: 12, 
        height: 24, 
        borderRadius: 12, // hình viên thuốc
    },
    medName: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1E293B', 
    },
    medFrequency: { 
        fontSize: 14, 
        color: '#64748B', 
        marginTop: 2, 
    },
});

export default MedicationCard;
