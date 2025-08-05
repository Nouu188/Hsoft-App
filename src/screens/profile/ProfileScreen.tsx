import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import ProfileMenuItem from '@/components/specific/profile/ProfileMenuItem';
import ProfileHeader from '@/components/specific/profile/ProfileHeader';
import UserInfo from '../../components/specific/profile/UserInfo';
import QuickActions from '@/components/specific/profile/QuickAction';

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProfileHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        <UserInfo />
        <QuickActions />
        
        <View style={styles.menuList}>
          <ProfileMenuItem icon="medkit-outline" text="Add a prescriber" />
          <ProfileMenuItem icon="storefront-outline" text="Add a pharmacy" />
          <ProfileMenuItem icon="git-network-outline" text="Add an appointment" />
          <ProfileMenuItem icon="people-outline" text="Add a dependent" />
          <ProfileMenuItem icon="add-circle-outline" text="Add..." />
        </View>
      </ScrollView>
      {/* Tab Bar sẽ là một component riêng trong hệ thống navigation của bạn */}
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  menuList: {
    marginTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
});

export default ProfileScreen;