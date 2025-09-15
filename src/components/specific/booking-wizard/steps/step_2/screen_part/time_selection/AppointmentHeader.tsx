import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES } from '@/constants/theme';

interface Props {
    onBack: () => void;
}

const AppointmentHeader: React.FC<Props> = ({ onBack }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={onBack}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chọn giờ khám</Text>
            <View style={styles.iconButton} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginTop: SIZES.padding * 2,
    },
    iconButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});

export default AppointmentHeader;
