import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/LanguagesScreen.tsx';
import type {ProfileStackParamList} from './types.ts'
const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerShown: false, // Ẩn header mặc định
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      {/* Nếu có các màn hình khác như "Edit Profile", "Add Dependent", hãy thêm vào đây */}
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;