// src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme'; // Import theme đầy đủ

// --- Component con: Header ---
const ProfileHeader = () => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.headerButton}>
      <Ionicons name="menu-outline" size={28} color={COLORS.textDark} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>My Profile</Text>
    <TouchableOpacity style={styles.headerButton}>
      <Ionicons name="settings-outline" size={24} color={COLORS.textDark} />
    </TouchableOpacity>
  </View>
);

// --- Component con: Thông tin cá nhân ---
const UserInfo = () => (
  <View style={styles.userInfoContainer}>
    <View>
      <Image 
        source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} // Placeholder avatar
        style={styles.avatar} 
      />
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="pencil" size={12} color={COLORS.primary} />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// --- Component con: Các nút hành động nhanh ---
const QuickActions = () => {
  const actions = [
    { name: 'Meds', icon: 'medkit-outline' },
    { name: 'Tracked', icon: 'pulse-outline' },
    { name: 'Documents', icon: 'document-text-outline' },
    { name: 'Download', icon: 'download-outline' },
  ];

  return (
    <View style={styles.quickActionsContainer}>
      {actions.map((action) => (
        <TouchableOpacity key={action.name} style={styles.quickActionButton}>
          <Ionicons name={action.icon as any} size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>{action.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// --- Component con: Các mục trong danh sách cài đặt ---
interface ProfileMenuItemProps {
  icon: string;
  text: string;
  onPress?: () => void;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemIconContainer}>
      <Ionicons name={icon as any} size={22} color={COLORS.primary} />
    </View>
    <Text style={styles.menuItemText}>{text}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textLight} />
  </TouchableOpacity>
);

// --- Màn hình chính ---
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  headerButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    ...FONTS.h2,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginVertical: SIZES.padding,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    ...SHADOWS.light,
  },
  editButtonText: {
    ...FONTS.body5,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SIZES.base / 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.padding,
  },
  quickActionButton: {
    backgroundColor: COLORS.primaryLight,
    padding: SIZES.base * 1.5,
    borderRadius: SIZES.radius * 2,
    alignItems: 'center',
    width: (SIZES.width - SIZES.padding * 2 - SIZES.base * 3) / 4, // Chia đều 4 nút
  },
  quickActionText: {
    ...FONTS.body5,
    color: COLORS.text,
    marginTop: SIZES.base,
    fontWeight: '500',
  },
  menuList: {
    marginTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
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

export default ProfileScreen;