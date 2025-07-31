// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { COLORS } from './src/constants/theme';
import TabNavigator from './src/navigation/TabNavigator';
import { NavigationContainer } from '@react-navigation/native';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <TabNavigator />
    </NavigationContainer>
  );
};

export default App;