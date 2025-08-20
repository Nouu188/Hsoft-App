import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS,SIZES } from '../constants/theme';
const SplashScreen = () => {
  return (
    <LinearGradient
      colors={['#E6F0FF', '#FFFFFF']} // Màu gradient từ xanh nhạt đến trắng
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0FF" />
      <View style={styles.content}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Medixia</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3A5C94', // Màu chữ Medixia
  },
});

export default SplashScreen;