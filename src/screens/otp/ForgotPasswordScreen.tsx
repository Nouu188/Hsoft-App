import React from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '@/constants/theme';

import Header from '@/components/specific/auth/forgot_password/Header';
import Content from '@/components/specific/auth/forgot_password/Content';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordScreen'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {

  const handleResetPassword = (email: string) => {
    console.log('Gửi yêu cầu reset mật khẩu cho email:', email);
    navigation.navigate('OTPScreen', { email, type: 'forgotPassword' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <Header onGoBack={() => navigation.goBack()} />
          <Content onSubmit={handleResetPassword} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
