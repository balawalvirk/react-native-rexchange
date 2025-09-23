import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import type { Subscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { updateUser } from '../firebase/collections/users';
import { useAuth } from '../providers/authProvider';

Notifications.setNotificationHandler({
  // eslint-disable-next-line @typescript-eslint/require-await
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const usePushNotifications = (): {
  notification: Notification | null;
} => {
  const { user } = useAuth();
  const [devicePushToken, setDevicePushToken] = useState<string>();
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    if (!user) return; // Don't initialize push notifications if user is not authenticated
    
    if (!user?.token) {
      registerForPushNotificationsAsync().then((token) =>
        setDevicePushToken(token),
      ).catch((error) => {
        console.error('Failed to register for push notifications:', error);
      });
    } else {
      setDevicePushToken(user.token);
    }
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);
  async function registerForPushNotificationsAsync() {
    if (!user?.docId) {
      console.log('User not authenticated, skipping push notification registration');
      return;
    }

    let token;
    try {
      if (Device.isDevice) {
        // Check if device supports push notifications
        const isPushNotificationSupported = await Notifications.isDeviceRegisteredForRemoteNotificationsAsync();
        if (!isPushNotificationSupported) {
          console.log('Device does not support push notifications');
          await updateUser(user?.docId, { token: null });
          return;
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Push notification permission not granted');
          await updateUser(user?.docId, { token: null });
          return;
        }
        
        // Add retry logic for token generation
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const tokenData = await Notifications.getDevicePushTokenAsync();
            token = tokenData.data;
            console.log('Push token generated successfully:', token);
            await updateUser(user?.docId, { token });
            break;
          } catch (tokenError) {
            retryCount++;
            console.log(`Push token generation attempt ${retryCount} failed:`, tokenError);
            if (retryCount >= maxRetries) {
              throw tokenError;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      // Update user with null token to indicate failure
      try {
        await updateUser(user?.docId, { token: null });
      } catch (updateError) {
        console.error('Error updating user token:', updateError);
      }
    }

    return token;
  }
  return { notification } as any;
};

export default usePushNotifications;
