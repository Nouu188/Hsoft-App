import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS, SIZES } from '@/constants/theme';


const SettingsHeader = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={28} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.headerButton} /> {/* Placeholder để căn giữa title */}
        </View>
    );
};

// --- Component con: Mục trong danh sách ---
// Tái sử dụng component từ ProfileScreen nhưng có thể tùy chỉnh nếu cần
interface SettingsMenuItemProps {
    icon: string;
    text: string;
    onPress?: () => void;
}

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemIconContainer}>
            <Ionicons name={icon as any} size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.menuItemText}>{text}</Text>
        <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textLight} />
    </TouchableOpacity>
);

// --- Component con: Tiêu đề của một nhóm ---
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

// --- Màn hình chính ---
const SettingsScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <SettingsHeader />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.menuList}>
                    <SectionHeader title="Reminder" />
                    <SettingsMenuItem icon="timer-outline" text="Smart & Safety" />
                    <SettingsMenuItem icon="volume-medium-outline" text="Volume & vibration" />
                    <SettingsMenuItem icon="musical-notes-outline" text="Ringtone & haptic" />

                    <SectionHeader title="General" />
                    <SettingsMenuItem icon="options-outline" text="Preferences" />
                    <SettingsMenuItem icon="document-text-outline" text="Essential settings" />
                    <SettingsMenuItem icon="cloud-upload-outline" text="Back up / Restore data" />
                    <SettingsMenuItem icon="refresh-outline" text="Restore subscription" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding / 2, // Giảm padding để nút gần mép hơn
        paddingVertical: SIZES.base,
    },
    headerButton: {
        width: 50, // Tăng vùng nhấn
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...FONTS.h2,
    },
    menuList: {
        paddingHorizontal: SIZES.padding,
        marginTop: SIZES.padding,
    },
    sectionHeader: {
        ...FONTS.h3,
        color: COLORS.textDark,
        marginTop: SIZES.padding,
        marginBottom: SIZES.base * 1.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 1.5,
        padding: SIZES.base * 1.5,
        marginBottom: SIZES.base * 1.5,
        ...SHADOWS.light,
    },
    menuItemIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        ...FONTS.body3,
        flex: 1,
        marginLeft: SIZES.padding,
        fontWeight: '600',
        color: COLORS.textDark,
    },
});

export default SettingsScreen;