import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import {
  User,
  LogOut,
  Heart,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { NYC_ATTRACTIONS } from '@/constants/attractions';
import { useAttractions } from '@/lib/attractions-context';
import { useTheme, type ThemeMode } from '@/lib/theme-context';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function ProfileScreen() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'favorites' | 'visited'>('favorites');
  const { favorites, visited, removeFavorite } = useAttractions();
  const { themeMode, setTheme } = useTheme();
  const colors = useThemeColors();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleRemoveFavorite = async (attractionId: string) => {
    await removeFavorite(attractionId);
  };

  const getAttractionById = (id: string) => {
    return NYC_ATTRACTIONS.find(a => a.id === id);
  };

  const viewAttractionDetails = (id: string) => {
    router.push(`/${id}` as any);
  };

  if (isAuthLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const displayAttractions = selectedTab === 'favorites' 
    ? favorites.map(id => ({ attraction_id: id }))
    : visited.map(id => ({ attraction_id: id }));

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    setShowThemeMenu(false);
  };

  const themeIcon = themeMode === 'dark' ? Moon : themeMode === 'light' ? Sun : Monitor;

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            <User size={48} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.firstname} {user.lastname}
            </Text>
            <Text style={[styles.username, { color: colors.secondaryText }]}>@{user.username}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.themeButton, { borderColor: colors.primary }]} 
            onPress={() => setShowThemeMenu(!showThemeMenu)}
          >
            {themeIcon === Moon && <Moon size={20} color={colors.primary} />}
            {themeIcon === Sun && <Sun size={20} color={colors.primary} />}
            {themeIcon === Monitor && <Monitor size={20} color={colors.primary} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.error }]} onPress={handleLogout}>
            <LogOut size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {showThemeMenu && (
        <View style={[styles.themeMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.themeOption, themeMode === 'light' && { backgroundColor: colors.primary + '20' }]}
            onPress={() => handleThemeChange('light')}
          >
            <Sun size={20} color={colors.text} />
            <Text style={[styles.themeOptionText, { color: colors.text }]}>Light</Text>
            {themeMode === 'light' && <CheckCircle2 size={20} color={colors.primary} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.themeOption, themeMode === 'dark' && { backgroundColor: colors.primary + '20' }]}
            onPress={() => handleThemeChange('dark')}
          >
            <Moon size={20} color={colors.text} />
            <Text style={[styles.themeOptionText, { color: colors.text }]}>Dark</Text>
            {themeMode === 'dark' && <CheckCircle2 size={20} color={colors.primary} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.themeOption, themeMode === 'system' && { backgroundColor: colors.primary + '20' }]}
            onPress={() => handleThemeChange('system')}
          >
            <Monitor size={20} color={colors.text} />
            <Text style={[styles.themeOptionText, { color: colors.text }]}>System</Text>
            {themeMode === 'system' && <CheckCircle2 size={20} color={colors.primary} />}
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.contactInfo, { backgroundColor: colors.card }]}>
        <View style={styles.contactItem}>
          <Mail size={16} color={colors.secondaryText} />
          <Text style={[styles.contactText, { color: colors.text }]}>{user.email}</Text>
          {user.email_verified && (
            <CheckCircle2 size={16} color={colors.success} />
          )}
        </View>
        {user.phone && (
          <View style={styles.contactItem}>
            <Phone size={16} color={colors.secondaryText} />
            <Text style={[styles.contactText, { color: colors.text }]}>{user.phone}</Text>
            {user.phone_verified && (
              <CheckCircle2 size={16} color={colors.success} />
            )}
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <Heart size={24} color={colors.heartRed} fill={colors.heartRed} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{favorites.length}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Favorites</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <CheckCircle2 size={24} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{visited.length}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Visited</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <MapPin size={24} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{NYC_ATTRACTIONS.length}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Total</Text>
        </View>
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/(profile)/friends')}>
          <Text style={[styles.socialButtonText, { color: colors.text }]}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/(profile)/requests')}>
          <Text style={[styles.socialButtonText, { color: colors.text }]}>Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/(profile)/circles')}>
          <Text style={[styles.socialButtonText, { color: colors.text }]}>Circles</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/(profile)/lists')}>
          <Text style={[styles.socialButtonText, { color: colors.text }]}>Lists</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'favorites' && { backgroundColor: colors.secondaryBackground }]}
          onPress={() => setSelectedTab('favorites')}
        >
          <Heart
            size={20}
            color={selectedTab === 'favorites' ? colors.heartRed : colors.secondaryText}
            fill={selectedTab === 'favorites' ? colors.heartRed : 'none'}
          />
          <Text style={[styles.tabText, { color: colors.secondaryText }, selectedTab === 'favorites' && { color: colors.text }]}>
            Favorites
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'visited' && { backgroundColor: colors.secondaryBackground }]}
          onPress={() => setSelectedTab('visited')}
        >
          <CheckCircle2
            size={20}
            color={selectedTab === 'visited' ? colors.success : colors.secondaryText}
          />
          <Text style={[styles.tabText, { color: colors.secondaryText }, selectedTab === 'visited' && { color: colors.text }]}>
            Visited
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {displayAttractions.length === 0 ? (
          <View style={styles.emptyState}>
            {selectedTab === 'favorites' ? (
              <>
                <Heart size={64} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Favorites Yet</Text>
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  Start exploring and save your favorite attractions
                </Text>
              </>
            ) : (
              <>
                <MapPin size={64} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Visits Yet</Text>
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  Check in at attractions as you explore NYC
                </Text>
              </>
            )}
          </View>
        ) : (
          displayAttractions.map((item) => {
            const attraction = getAttractionById(item.attraction_id);
            if (!attraction) return null;

            return (
              <TouchableOpacity
                key={item.attraction_id}
                style={[styles.attractionCard, { backgroundColor: colors.card }]}
                onPress={() => viewAttractionDetails(item.attraction_id)}
              >
                <Image
                  source={{ uri: attraction.imageUrl }}
                  style={styles.attractionImage}
                  contentFit="cover"
                />
                <View style={styles.attractionInfo}>
                  <View style={styles.attractionHeader}>
                    <Text style={[styles.attractionName, { color: colors.text }]}>{attraction.name}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.categoryText, { color: colors.primary }]}>
                        {attraction.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.attractionDescription, { color: colors.secondaryText }]} numberOfLines={2}>
                    {attraction.description}
                  </Text>
                  <View style={styles.attractionFooter}>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color={colors.warning} fill={colors.warning} />
                      <Text style={[styles.ratingText, { color: colors.text }]}>4.5</Text>
                    </View>
                    {selectedTab === 'favorites' && (
                      <TouchableOpacity
                        style={[styles.removeButton, { backgroundColor: colors.error }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(item.attraction_id);
                        }}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                    {selectedTab === 'visited' && (
                      <View style={styles.visitedDate}>
                        <Calendar size={14} color={colors.secondaryText} />
                        <Text style={[styles.visitedDateText, { color: colors.secondaryText }]}>Visited</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  themeMenu: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  contactInfo: {
    padding: 20,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  socialButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  socialButtonText: {
    fontWeight: '700' as const,
  },
  statBox: {
    flex: 1,
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
  statNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  adContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  attractionCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  attractionImage: {
    width: '100%',
    height: 180,
  },
  attractionInfo: {
    padding: 16,
  },
  attractionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  attractionName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  attractionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  attractionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  visitedDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visitedDateText: {
    fontSize: 13,
  },
});
