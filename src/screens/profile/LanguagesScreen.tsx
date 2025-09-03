import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

import { COLORS, FONTS, SHADOWS, SIZES } from '@/constants/theme'; // Adjust path as per your project structure
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types';
import { useNavigation } from '@react-navigation/native';
type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Profile'
>;
const LanguageSelectionScreen: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const languages = [
        'English (US)',
        'English (UK)',
        'French',
        'German',
        'Japanese',
        'Việt Nam',
        // Add more languages as needed
    ];

    const LanguageOption: React.FC<{ language: string }> = ({ language }) => (
        <TouchableOpacity
            style={[
                styles.languageOption,
                selectedLanguage === language && styles.selectedLanguageOption
            ]}
            onPress={() => setSelectedLanguage(language)}
        >
            <View style={styles.languageIconContainer}>
                {/* You can replace this with actual flag icons or more specific language icons */}
                <Text style={styles.languageIcon}>P</Text> 
            </View>
            <Text style={[
                styles.languageText,
                selectedLanguage === language && styles.selectedLanguageText
            ]}>{language}</Text>
            {selectedLanguage === language ? (
                <Ionicons name="radio-button-on" size={24} color={COLORS.white} />
            ) : (
                <Ionicons name="radio-button-off" size={24} color={COLORS.textDark} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Languages</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Selected Language</Text>
                    <LanguageOption language={selectedLanguage} />
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.allLanguagesHeader}>
                        <Text style={styles.sectionHeader}>All Languages</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {languages.map((lang, index) => (
                        <LanguageOption key={index} language={lang} />
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Settings   </Text>
                <Ionicons name="checkmark-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.base,
    },
    backButton: {
        marginRight: SIZES.base,
    },
    headerTitle: {
        ...FONTS.h2,
        color: COLORS.textDark,
    },
    scrollViewContent: {
        paddingBottom: SIZES.padding , 
    },
    sectionContainer: {
        marginTop: SIZES.padding,
        paddingHorizontal: SIZES.padding,
    },
    sectionHeader: {
        ...FONTS.h3,
        color: COLORS.textDark,
        marginBottom: SIZES.base * 1.5,
    },
    allLanguagesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.base * 1.5,
    },
    seeAllText: {
        ...FONTS.body4,
        color: COLORS.lightBlue,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius*4,
        padding: SIZES.padding/1.4,
        marginBottom: SIZES.base,
        ...SHADOWS.medium,
        elevation: 2,
    },
    selectedLanguageOption: {
        backgroundColor: COLORS.lightBlue,
    },
    languageIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.padding,
    },
    languageIcon: {
        ...FONTS.h3,
        color: COLORS.textDark,
    },
    languageText: {
        flex: 1,
        ...FONTS.body3,
        color: COLORS.textDark,
    },
    selectedLanguageText: {
        color: COLORS.white,
    },
    saveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.textDark,
        borderRadius: SIZES.radius*4,
        paddingVertical: SIZES.padding,
        marginHorizontal: SIZES.padding,
        marginBottom:SIZES.padding*3.5,
    },
    saveButtonText: {
        ...FONTS.h3,
        color: COLORS.white,
        marginLeft: SIZES.base,
    },
});

export default LanguageSelectionScreen;