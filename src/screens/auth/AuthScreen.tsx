import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, LinearTransition } from 'react-native-reanimated';
import Ionicons from '@react-native-vector-icons/ionicons';

import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import AuthInput from '../../components/AuthInput';
import { useAuthStore } from '../../store/useAuthStore'; 

const { width } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  const { login, isLoading, error } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const formPosition = useSharedValue(0);

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: formPosition.value }],
    };
  });

  const switchToLogin = () => {
    formPosition.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
    setIsLoginView(true);
  };

  const switchToRegister = () => {
    formPosition.value = withTiming(-width, { duration: 300, easing: Easing.out(Easing.quad) });
    setIsLoginView(false);
  };

  const handleLogin = async () => {
    try {
      console.log('[AuthScreen] handleLogin triggered. Calling login action...');
console.log(identifier, password)
      await login({ identifier, password });

      console.log('[AuthScreen] Login action completed successfully.');
    } catch (e) {
      console.error("[AuthScreen] Caught error from login action.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Ionicons name="medkit" size={60} color={COLORS.primary} />
            <Text style={styles.title}>MedCompanion</Text>
            <Text style={styles.subtitle}>Your daily health partner</Text>
          </View>

          <View style={styles.formWrapper}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={styles.toggleButton} onPress={switchToLogin}>
                <Text style={[styles.toggleText, isLoginView && styles.toggleTextActive]}>Login</Text>
                  {isLoginView && (
                    <Animated.View
                      style={styles.activeIndicator}
                      layout={LinearTransition.duration(300)}
                    />
                  )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleButton} onPress={switchToRegister}>
                <Text style={[styles.toggleText, !isLoginView && styles.toggleTextActive]}>Register</Text>
                  {!isLoginView && (
                    <Animated.View
                      style={styles.activeIndicator}
                      layout={LinearTransition.duration(300)}
                    />
                  )}
              </TouchableOpacity>
            </View>

            <View style={{ overflow: 'hidden' }}>
              <Animated.View style={[styles.animatedForm, formAnimatedStyle]}>
                <View style={styles.formPage}>
                  <AuthInput icon="mail-outline" placeholder="identifier" value={identifier} onChangeText={setIdentifier} />
                  <AuthInput icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} isPassword />
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.submitButton} onPress={handleLogin} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitButtonText}>Login</Text>}
                  </TouchableOpacity>
                </View>

                <View style={styles.formPage}>
                  <AuthInput icon="mail-outline" placeholder="identifier" value={identifier} onChangeText={setIdentifier} />
                  <AuthInput icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} isPassword />
                  <AuthInput icon="lock-closed-outline" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} isPassword />
                  <TouchableOpacity style={styles.submitButton} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitButtonText}>Create Account</Text>}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', 
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  title: {
    ...FONTS.h1,
    marginTop: SIZES.padding,
    color: COLORS.primary,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.textLight,
    marginTop: SIZES.base,
  },
  formWrapper: {
    // Container cho toàn bộ form
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius * 2,
    marginBottom: SIZES.padding * 1.5,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.padding * 0.75,
  },
  toggleText: {
    ...FONTS.h4,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -SIZES.base / 2,
    height: 3,
    width: '40%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  animatedForm: {
    flexDirection: 'row',
    width: width * 2, 
    marginLeft: -SIZES.padding, 
  },
  formPage: {
    width: width, 
    paddingHorizontal: SIZES.padding, 
  },
  forgotPassword: {
    ...FONTS.body4,
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: SIZES.padding * 1.5,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 1.5,
    alignItems: 'center',
    ...SHADOWS.medium,
    height: 65,
    justifyContent: 'center',
  },
  submitButtonText: {
    ...FONTS.h3,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default AuthScreen;