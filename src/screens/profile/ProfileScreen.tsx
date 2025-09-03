import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import ProfileMenuItem from '@/components/specific/profile/ProfileMenuItem';
import ProfileHeader from '@/components/specific/profile/ProfileHeader';
import UserInfo from '../../components/specific/profile/UserInfo';
import SettingsMenuItem from '@/components/specific/profile/setting/SettingMenuItem';
import { useAuthStore } from '@/store/useAuthStore';
const ProfileScreen: React.FC = () => {
  const { logout } = useAuthStore();
  
      const handleLogout = async () => {
          try {
          console.log('[AuthScreen] handleLogout triggered. Calling logout action...');
          await logout();
  
          console.log('[AuthScreen] Logout action completed successfully.');
          } catch (e) {
          console.error("[AuthScreen] Caught error from logout action.");
          }
      };
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
  <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

  {/* Header background */}
  <View style={styles.headerBackground} />

  {/* Nội dung header */}
  <View style={styles.headerWrapper}>
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
      <ProfileMenuItem icon="person-outline" text="Account Settings" />
      <ProfileMenuItem icon="wallet-outline" text="Payment Method" />
      <View style={{ borderTopWidth: 0.2, marginBottom: SIZES.base * 1.5, height: SIZES.padding * 1.2, width: '90%', marginTop: SIZES.padding * 1.2, alignSelf: 'center', borderColor: COLORS.primary }} />
      <SettingsMenuItem icon="language-outline" text="Languages" />
      <SettingsMenuItem icon="heart-outline" text="Favorite Doctors" />
      <SettingsMenuItem icon="musical-notes-outline" text="Ringtone & haptic" />
      <SettingsMenuItem icon="information-circle-outline" text="Help & Supports" />
      <ProfileMenuItem icon="notifications-outline" text="Thông báo" />
      <SettingsMenuItem icon="shield-outline" text="Privacys" />
      <SettingsMenuItem icon="log-out-outline" text="Log out" onPress={handleLogout}/>
    </View>
  </ScrollView>
</SafeAreaView>

  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Fallback background
  },
  headerBackground: {
  position: 'absolute',
  backgroundColor: COLORS.primary,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
},
useInfoStyle: {
   marginTop: -SIZES.padding * 2, // kéo card lên (tùy chỉnh giá trị để được khoảng 1/2)
  paddingHorizontal: SIZES.padding,
},
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    // Adjusted height to visually match the image's background coverage
    height: 180, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
  },
  headerWrapper: {
    // No paddingTop here, ProfileHeader will handle its own padding relative to SafeAreaView
  },
  scrollViewContent: {
    paddingBottom: SIZES.padding * 2,
    // Negative margin to pull the content up slightly,
    // making the UserInfo card overlap the gradient more as in the image.
    marginTop: -SIZES.padding * 2, 
  },
  
  menuList: {
    marginTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
});

export default ProfileScreen;