import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { COLORS } from './src/constants/theme';

import AuthNavigator from './src/navigation/AuthNavigator';
import TabNavigator from './src/navigation/TabNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { MenuProvider } from 'react-native-popup-menu';

const App: React.FC = () => {
  const accessToken = useAuthStore(state => state.accessToken);
  const isLoadingAuth = useAuthStore(state => state.isLoading);
  const hydrateAuth = useAuthStore(state => state.hydrate);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  if (isLoadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <MenuProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        {accessToken ? <TabNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default App;