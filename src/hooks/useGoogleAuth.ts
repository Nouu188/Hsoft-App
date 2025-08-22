// src/hooks/useGoogleAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LOGIN_WITH_GOOGLE_MUTATION } from '@/api/mutations/authMutations'; // Sẽ tạo ở bước sau
import { useAuthStore } from '@/store/useAuthStore';
import { accountClient } from '@/api/apoloClient';

// Lấy webClientId từ file cấu hình của bạn
// Đây là Client ID của "Web application" mà bạn đã tạo trên Google Cloud Console
const GOOGLE_WEB_CLIENT_ID = '914111663994-qrtk1mb78ehddf545q1atqpdhikdhb16.apps.googleusercontent.com';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const setAuthData = useAuthStore(state => state.setAuthData);

  useEffect(() => {
    // Cấu hình Google Sign-In một lần duy nhất
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false, // Đặt là false để lấy idToken
    });
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.data?.idToken) {
        console.log('[GoogleAuth] Got ID Token, sending to backend...');
        
        // Gọi mutation GraphQL để xác thực ở backend
        const { data } = await accountClient.mutate({
          mutation: LOGIN_WITH_GOOGLE_MUTATION,
          variables: {
            googleLoginInput: {
              idToken: userInfo.data.idToken,
            },
          },
        });

        if (data?.loginWithGoogle) {
          const { user, accessToken } = data.loginWithGoogle;

          setAuthData(user, accessToken);
          console.log('[GoogleAuth] Login successful!');
        } else {
          throw new Error('Invalid response from server.');
        }
      } else {
        throw new Error('Google ID Token not found.');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('[GoogleAuth] User cancelled the login flow.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('[GoogleAuth] Sign in is in progress already.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Lỗi', 'Dịch vụ Google Play không khả dụng hoặc đã lỗi thời.');
      } else {
        console.error('[GoogleAuth] An unexpected error occurred:', error);
        Alert.alert('Đăng nhập thất bại', error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setAuthData]);

  return {
    isGoogleLoading: isLoading,
    signInWithGoogle: handleGoogleSignIn,
  };
};