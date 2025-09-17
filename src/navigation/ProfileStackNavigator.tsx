import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import LanguageSelectionScreen from '@/screens/profile/LanguagesScreen.tsx';
import type {ProfileStackParamList} from './types.ts'
import RingtoneSelectionScreen from '@/screens/profile/RingToneScreen.tsx';
import AddAudioScreen from '@/components/specific/profile/setting/ringtone/AddRingTones.tsx';
import EditProfileScreen from '@/components/specific/profile/setting/edit_profile/EditProfileScreen.tsx';
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
      <Stack.Screen name="Languages" component={LanguageSelectionScreen} />
      <Stack.Screen name="Ringtone" component={RingtoneSelectionScreen} />
      <Stack.Screen name="AddRingtone" component={AddAudioScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      {/* Nếu có các màn hình khác như "Edit Profile", "Add Dependent", hãy thêm vào đây */}
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;