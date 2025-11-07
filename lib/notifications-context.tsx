import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth-context';

export interface AppNotification {
  id: string;
  type: 'mention' | 'list_added' | 'new_member' | 'nearby_reminder' | 'friend_request' | 'check_in';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  expoPushToken: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  isLoading: boolean;
}

const NOTIFICATIONS_KEY = '@notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationsProvider, useNotifications] = createContextHook(() => {
  useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        console.log('[Notifications] Loading notifications');
        const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        if (stored) {
          setNotifications(JSON.parse(stored));
        }
      } catch (error) {
        console.error('[Notifications] Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Web platform, skipping push token registration');
      return;
    }

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        console.log('[Notifications] Push token:', token);
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notifications] Notification received:', notification);
      
      const newNotification: AppNotification = {
        id: notification.request.identifier,
        type: (notification.request.content.data?.type as AppNotification['type']) || 'mention',
        title: notification.request.content.title || 'New Notification',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Notifications] Notification tapped:', response);
    });

    return () => {
      (notificationListener.remove as any)();
      (responseListener.remove as any)();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      setNotifications(updated);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[Notifications] Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[Notifications] Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[Notifications] Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('[Notifications] Error clearing all:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Web platform, permissions not required');
      return true;
    }

    try {
      const existingStatus = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus.status !== 'granted') {
        finalStatus = await Notifications.requestPermissionsAsync();
      }

      if (finalStatus.status !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Notifications] Error requesting permissions:', error);
      return false;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    expoPushToken,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestPermissions,
    isLoading,
  };

  return value;
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const existingStatus = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus.status !== 'granted') {
      finalStatus = await Notifications.requestPermissionsAsync();
    }

    if (finalStatus.status !== 'granted') {
      console.log('[Notifications] Failed to get push token for push notifications');
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.log('[Notifications] No project ID found');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('[Notifications] Got push token:', token);
    return token.data;
  } catch (error) {
    console.error('[Notifications] Error getting push token:', error);
    return null;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform, skipping local notification');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
}
