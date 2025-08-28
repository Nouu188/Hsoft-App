import React from 'react';
import AuthScreen from '../screens/auth/AuthScreen'
import TabNavigator from './TabNavigator'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type {AuthStackParamList} from './types'

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;