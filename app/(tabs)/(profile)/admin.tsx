import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Settings,
  BarChart3,
  Users,
  MapPin,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Shield,
  XCircle,
  CheckCheck,
} from 'lucide-react-native';
import { useAdmin } from '@/lib/admin-context';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function AdminToolsScreen() {
  const { isAdmin, featureFlags, metrics, reportedLinks, toggleFeatureFlag, blockLink, clearLink, refreshMetrics, isLoading } = useAdmin();
  const colors = useThemeColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)/(profile)');
    }
  }, [isAdmin]);

  useEffect(() => {
    refreshMetrics();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMetrics();
    setRefreshing(false);
  };

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const pendingReports = reportedLinks.filter((link) => link.status === 'pending').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <Stack.Screen
        options={{
          title: 'Admin Tools',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Metrics Dashboard</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <Users size={28} color={colors.primary} />
              <Text style={[styles.metricValue, { color: colors.text }]}>{metrics.totalUsers}</Text>
              <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Total Users</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <TrendingUp size={28} color={colors.success} />
              <Text style={[styles.metricValue, { color: colors.text }]}>{metrics.activeUsersToday}</Text>
              <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Active Today</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <MapPin size={28} color={colors.warning} />
              <Text style={[styles.metricValue, { color: colors.text }]}>{metrics.totalAttractions}</Text>
              <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Attractions</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <CheckCircle2 size={28} color={colors.success} />
              <Text style={[styles.metricValue, { color: colors.text }]}>{metrics.totalCheckIns}</Text>
              <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Check-ins</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <MessageSquare size={28} color={colors.primary} />
              <Text style={[styles.metricValue, { color: colors.text }]}>{metrics.totalChats}</Text>
              <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Chats</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <AlertTriangle size={28} color={colors.error} />
              <Text style={[styles.metricValue, { color: colors.text }]}>{pendingReports}</Text>
              <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>Reports</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Feature Flags</Text>
          </View>

          <View style={[styles.flagsContainer, { backgroundColor: colors.card }]}>
            {featureFlags.map((flag) => (
              <View key={flag.key} style={[styles.flagRow, { borderBottomColor: colors.border }]}>
                <View style={styles.flagInfo}>
                  <Text style={[styles.flagName, { color: colors.text }]}>{flag.name}</Text>
                  <Text style={[styles.flagDescription, { color: colors.secondaryText }]}>
                    {flag.description}
                  </Text>
                </View>
                <Switch
                  value={flag.enabled}
                  onValueChange={() => toggleFeatureFlag(flag.key)}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={flag.enabled ? colors.primary : colors.secondaryText}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color={colors.error} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Link Moderation</Text>
          </View>

          {reportedLinks.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Shield size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No reported links
              </Text>
            </View>
          ) : (
            <View style={[styles.linksContainer, { backgroundColor: colors.card }]}>
              {reportedLinks.map((link) => (
                <View key={link.id} style={[styles.linkRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.linkInfo}>
                    <View style={styles.linkHeader}>
                      <Text style={[styles.linkUrl, { color: colors.text }]} numberOfLines={1}>
                        {link.url}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              link.status === 'blocked'
                                ? colors.error + '20'
                                : link.status === 'cleared'
                                ? colors.success + '20'
                                : colors.warning + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                link.status === 'blocked'
                                  ? colors.error
                                  : link.status === 'cleared'
                                  ? colors.success
                                  : colors.warning,
                            },
                          ]}
                        >
                          {link.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.linkReason, { color: colors.secondaryText }]}>
                      {link.reason}
                    </Text>
                    <Text style={[styles.linkMeta, { color: colors.secondaryText }]}>
                      Reported by {link.reportedBy} • {new Date(link.reportedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  {link.status === 'pending' && (
                    <View style={styles.linkActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error }]}
                        onPress={() => blockLink(link.id)}
                      >
                        <XCircle size={16} color="#FFF" />
                        <Text style={styles.actionButtonText}>Block</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.success }]}
                        onPress={() => clearLink(link.id)}
                      >
                        <CheckCheck size={16} color="#FFF" />
                        <Text style={styles.actionButtonText}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  flagsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  flagInfo: {
    flex: 1,
    marginRight: 16,
  },
  flagName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  flagDescription: {
    fontSize: 13,
  },
  linksContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  linkRow: {
    padding: 16,
    borderBottomWidth: 1,
  },
  linkInfo: {
    marginBottom: 12,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  linkUrl: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  linkReason: {
    fontSize: 14,
    marginBottom: 4,
  },
  linkMeta: {
    fontSize: 12,
  },
  linkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
  },
});
