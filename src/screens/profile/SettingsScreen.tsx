import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SIZES } from '@/constants/theme';
import SettingsHeader from '@/components/specific/profile/setting/SettingHeader';
import SettingsMenuItem from '@/components/specific/profile/setting/SettingMenuItem';

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
});

export default SettingsScreen;