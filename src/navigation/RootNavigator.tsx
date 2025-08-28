import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator'; 
import OTPScreen from '@/screens/otp/OTPScreen';
import ForgotPasswordScreen from '@/screens/otp/ForgotPasswordScreen';
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;