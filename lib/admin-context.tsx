import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth-context';

interface FeatureFlag {
  key: string;
  name: string;
  enabled: boolean;
  description: string;
}

interface Metrics {
  totalUsers: number;
  totalAttractions: number;
  totalCheckIns: number;
  totalChats: number;
  activeUsersToday: number;
}

interface ReportedLink {
  id: string;
  url: string;
  reportedBy: string;
  reportedAt: string;
  reason: string;
  status: 'pending' | 'blocked' | 'cleared';
}

interface AdminContextValue {
  isAdmin: boolean;
  featureFlags: FeatureFlag[];
  metrics: Metrics;
  reportedLinks: ReportedLink[];
  toggleFeatureFlag: (key: string) => Promise<void>;
  blockLink: (id: string) => Promise<void>;
  clearLink: (id: string) => Promise<void>;
  refreshMetrics: () => Promise<void>;
  isLoading: boolean;
}

const FLAGS_KEY = '@admin_feature_flags';
const LINKS_KEY = '@admin_reported_links';

const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    key: 'chat_enabled',
    name: 'Chat System',
    enabled: true,
    description: 'Enable/disable chat functionality',
  },
  {
    key: 'check_ins_enabled',
    name: 'Check-ins',
    enabled: true,
    description: 'Allow users to check in at attractions',
  },
  {
    key: 'lists_enabled',
    name: 'Curated Lists',
    enabled: true,
    description: 'Enable curated lists feature',
  },
  {
    key: 'circles_enabled',
    name: 'Circles',
    enabled: true,
    description: 'Enable circles (close friends) feature',
  },
  {
    key: 'notifications_enabled',
    name: 'Notifications',
    enabled: true,
    description: 'Enable push notifications',
  },
  {
    key: 'ai_features_enabled',
    name: 'AI Features',
    enabled: true,
    description: 'Enable AI-powered features',
  },
];

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const { user } = useAuth();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(DEFAULT_FLAGS);
  const [reportedLinks, setReportedLinks] = useState<ReportedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    totalAttractions: 14,
    totalCheckIns: 0,
    totalChats: 0,
    activeUsersToday: 0,
  });

  const isAdmin = user?.username === 'admin' || user?.email === 'admin@example.com';

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        console.log('[Admin] Loading admin data');
        const flagsData = await AsyncStorage.getItem(FLAGS_KEY);
        if (flagsData) {
          setFeatureFlags(JSON.parse(flagsData));
        }

        const linksData = await AsyncStorage.getItem(LINKS_KEY);
        if (linksData) {
          setReportedLinks(JSON.parse(linksData));
        }
      } catch (error) {
        console.error('[Admin] Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      loadAdminData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const toggleFeatureFlag = async (key: string) => {
    try {
      const updated = featureFlags.map((flag) =>
        flag.key === key ? { ...flag, enabled: !flag.enabled } : flag
      );
      setFeatureFlags(updated);
      await AsyncStorage.setItem(FLAGS_KEY, JSON.stringify(updated));
      console.log(`[Admin] Toggled feature flag: ${key}`);
    } catch (error) {
      console.error('[Admin] Error toggling feature flag:', error);
    }
  };

  const blockLink = async (id: string) => {
    try {
      const updated = reportedLinks.map((link) =>
        link.id === id ? { ...link, status: 'blocked' as const } : link
      );
      setReportedLinks(updated);
      await AsyncStorage.setItem(LINKS_KEY, JSON.stringify(updated));
      console.log(`[Admin] Blocked link: ${id}`);
    } catch (error) {
      console.error('[Admin] Error blocking link:', error);
    }
  };

  const clearLink = async (id: string) => {
    try {
      const updated = reportedLinks.map((link) =>
        link.id === id ? { ...link, status: 'cleared' as const } : link
      );
      setReportedLinks(updated);
      await AsyncStorage.setItem(LINKS_KEY, JSON.stringify(updated));
      console.log(`[Admin] Cleared link: ${id}`);
    } catch (error) {
      console.error('[Admin] Error clearing link:', error);
    }
  };

  const refreshMetrics = async () => {
    try {
      console.log('[Admin] Refreshing metrics');
      setMetrics({
        totalUsers: Math.floor(Math.random() * 1000) + 100,
        totalAttractions: 14,
        totalCheckIns: Math.floor(Math.random() * 500),
        totalChats: Math.floor(Math.random() * 300),
        activeUsersToday: Math.floor(Math.random() * 50) + 10,
      });
    } catch (error) {
      console.error('[Admin] Error refreshing metrics:', error);
    }
  };

  const value: AdminContextValue = {
    isAdmin,
    featureFlags,
    metrics,
    reportedLinks,
    toggleFeatureFlag,
    blockLink,
    clearLink,
    refreshMetrics,
    isLoading,
  };

  return value;
});

export function useFeatureFlag(key: string): boolean {
  const { featureFlags } = useAdmin();
  const flag = featureFlags.find((f) => f.key === key);
  return flag?.enabled ?? false;
}
