import React from 'react';
import { View, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SIZES } from '@/constants/theme';
import ProfileMenuItem from '@/components/specific/profile/ProfileMenuItem';
import ProfileHeader from '@/components/specific/profile/ProfileHeader';
import UserInfo from '@/components/specific/profile/UserInfo';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types';
import { useNavigation } from '@react-navigation/native';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Profile'
>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { logout } = useAuthStore();

  // 👉 Lấy từ zustand
  const { isDarkMode, theme, toggleTheme } = useThemeStore();

  const handleLanguagePress = () => {
    navigation.navigate('Languages'); 
  };
  const handleRingTonePress = () => {
    navigation.navigate('Ringtone'); 
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Header background */}
      <View style={[styles.headerBackground, { backgroundColor: theme.primary }]} />

      <View>
        <ProfileHeader />
      </View>

      <View style={styles.useInfoStyle}>
        <UserInfo />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.menuList}>
          {/* Dark Mode toggle */}
          <ProfileMenuItem
            text="Dark Mode"
            isSwitch
            switchValue={isDarkMode}
            onSwitchChange={toggleTheme}
          />

          <ProfileMenuItem icon="person-outline" text="Account Settings" />
          <ProfileMenuItem icon="wallet-outline" text="Payment Method" />

          <View
            style={{
              borderTopWidth: 0.2,
              marginBottom: SIZES.base * 1.5,
              height: SIZES.padding * 1.2,
              width: '90%',
              marginTop: SIZES.padding * 1.2,
              alignSelf: 'center',
              borderColor: theme.primary,
            }}
          />

          <ProfileMenuItem
            icon="language-outline"
            text="Languages"
            onPress={handleLanguagePress}
          />
          <ProfileMenuItem icon="heart-outline" text="Favorite Doctors" />
          <ProfileMenuItem
            icon="musical-notes-outline"
            text="Ringtone & haptic"
            onPress={handleRingTonePress}
          />
          <ProfileMenuItem icon="information-circle-outline" text="Help & Supports" />
          <ProfileMenuItem icon="notifications-outline" text="Thông báo" />
          <ProfileMenuItem icon="shield-outline" text="Privacys" />
          <ProfileMenuItem
            icon="log-out-outline"
            text="Log out"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 150,
    width: '100%',
  },
  useInfoStyle: {
    marginTop: -SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
  scrollViewContent: {
    paddingBottom: SIZES.padding * 2,
    marginTop: -SIZES.padding * 2,
  },
  menuList: {
    marginTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
});

export default ProfileScreen;
