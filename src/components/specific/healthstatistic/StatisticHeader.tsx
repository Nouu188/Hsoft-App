import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '@/constants/theme';

const Header = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} >
                <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>Thống kê uống thuốc</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    titleContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    headerTitle: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SIZES.padding },
    backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, zIndex: 1 },
});

export default Header;