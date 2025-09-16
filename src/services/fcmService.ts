import { accountClient } from '@/api/apoloClient';
import { REGISTER_FCM_TOKEN } from '@/api/mutations/registerFCM_token';
import { DeviceTokenType } from '@/types/enums/deviceToken.enum';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class FcmService {
  async requestUserPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('[FCMService] Authorization status:', authStatus);
    }
    return enabled;
  }

  async getFcmToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestUserPermission();
      if (!hasPermission) {
        console.log('[FCMService] User has not granted notification permission.');
        return null;
      }

      const token = await messaging().getToken();
      if (token) {
        console.log('[FCMService] FCM Token:', token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('[FCMService] Error getting FCM token:', error);
      return null;
    }
  }

  async registerTokenWithServer(token: string): Promise<void> {
    try {
      const type = Platform.OS === 'ios' ? DeviceTokenType.APN : DeviceTokenType.FCM;
      console.log(`[FCMService] Registering token with server...`, { token, type });
      await accountClient.mutate({
        mutation: REGISTER_FCM_TOKEN,
        variables: { deviceToken: { token, type } },
      });
      console.log(`[FCMService] Token successfully registered with server.`);
    } catch (error) {
      console.error('[FCMService] Failed to register token with server:', error);
    }
  }
}

export const fcmService = new FcmService();