import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/types';

type HeaderProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
};

const Header: React.FC<HeaderProps> = ({ navigation }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base * 1.5, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, backgroundColor: COLORS.white, marginTop: SIZES.padding * 1.3 }}>
    <TouchableOpacity style={{ padding: 4 }} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="black" />
    </TouchableOpacity>
    <Text style={{ ...FONTS.h2, color: COLORS.textDark }}>Nhạc chuông</Text>
    <TouchableOpacity onPress={() => console.log('Search')} style={{ padding: 4 }}>
      <Ionicons name="search" size={24} color="black" />
    </TouchableOpacity>
  </View>
);

export default Header;
