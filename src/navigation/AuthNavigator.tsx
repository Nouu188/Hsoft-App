// src/navigation/AuthNavigator.tsx
import React from 'react';

// Import các màn hình bạn muốn điều hướng đến
import AuthScreen from '../screens/auth/AuthScreen';
import TabNavigator from './TabNavigator'; // Giả sử đây là màn hình chính sau khi đăng nhập
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Auth: undefined;
  MainApp: undefined; // Màn hình chính của ứng dụng (chứa các tab)
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      // Tạm thời đặt AuthScreen làm màn hình đầu tiên để xem
      initialRouteName="Auth" 
      screenOptions={{
        headerShown: false, // Ẩn header mặc định
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;