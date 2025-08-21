import type { NavigationProp } from '@react-navigation/native';
import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SIZES } from '../constants/theme';

const OnboardingScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
   const handleNavigateToAuth = () => {
    navigation.navigate('AuthFlow');
  };

   const handleNavigateToRegister = () => {
    navigation.navigate('AuthFlow', {
      screen: 'Auth', 
      params: { initialView: 'register' },
    });
  };
  return (
    <LinearGradient
      colors={['#E6F0FF', '#FFFFFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../assets/images/logo-removebg-preview.png')} style={styles.headerLogo} />
          <Text style={styles.headerText}>Medixia</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Image
            source={require('../assets/images/onboarding-collage.png')}
            style={styles.collageImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Perfect Health Center</Text>
          <Text style={styles.subtitle}>
            Find a health center that meets your needs and supports your well-being.
          </Text>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.getStartedButton} onPress={handleNavigateToAuth}>
            <Text style={styles.getStartedButtonText}>Bắt đầu</Text>
          </TouchableOpacity>
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={handleNavigateToRegister}>
              <Text style={[styles.signInText, styles.signInLink]}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop:SIZES.height*0.05
  },
  headerLogo: { width: 40, height: 40, marginRight: 12 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#3A5C94' },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collageImage: {
    width: '100%',
    height: 350,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A5F',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6F7D93',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#6F7D93',
  },
  signInLink: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});


export default OnboardingScreen;