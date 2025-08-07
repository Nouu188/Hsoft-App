import { accountClient } from '@/api/apoloClient';
import { REGISTER_FCM_TOKEN } from '@/api/mutations/registerFCM_token';
import messaging from '@react-native-firebase/messaging';

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

  async registerTokenWithServer(fcm_token: string): Promise<void> {
    try {
      console.log(`[FCMService] Registering token with server...`);
      await accountClient.mutate({
        mutation: REGISTER_FCM_TOKEN,
        variables: { fcm_token: fcm_token },
      });
      console.log(`[FCMService] Token successfully registered with server.`);
    } catch (error) {
      console.error('[FCMService] Failed to register token with server:', error);
    }
  }
}

export const fcmService = new FcmService();