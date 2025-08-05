// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { COLORS } from './src/constants/theme';

import AuthNavigator from './src/navigation/AuthNavigator';
import TabNavigator from './src/navigation/TabNavigator';
import { useAuthStore } from './src/store/useAuthStore';

const App: React.FC = () => {
  // Lắng nghe các state cần thiết từ store
  const accessToken = useAuthStore(state => state.accessToken);
  const isLoadingAuth = useAuthStore(state => state.isLoading);
  const hydrateAuth = useAuthStore(state => state.hydrate);

  // Chạy một lần duy nhất khi app khởi động để load token từ bộ nhớ
  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  // Hiển thị màn hình loading trong khi đang kiểm tra token
  if (isLoadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {/* Dựa vào sự tồn tại của accessToken để quyết định render navigator nào */}
      {accessToken ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
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