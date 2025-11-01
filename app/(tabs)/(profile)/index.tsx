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
} from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { NYC_ATTRACTIONS } from '@/constants/attractions';
import { useAttractions } from '@/lib/attractions-context';

export default function ProfileScreen() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'favorites' | 'visited'>('favorites');
  const { favorites, visited, removeFavorite } = useAttractions();

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#007AFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.firstname} {user.lastname}
            </Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Mail size={16} color="#666" />
          <Text style={styles.contactText}>{user.email}</Text>
          {user.email_verified && (
            <CheckCircle2 size={16} color="#34C759" />
          )}
        </View>
        {user.phone && (
          <View style={styles.contactItem}>
            <Phone size={16} color="#666" />
            <Text style={styles.contactText}>{user.phone}</Text>
            {user.phone_verified && (
              <CheckCircle2 size={16} color="#34C759" />
            )}
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Heart size={24} color="#FF3B30" fill="#FF3B30" />
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statBox}>
          <CheckCircle2 size={24} color="#34C759" />
          <Text style={styles.statNumber}>{visited.length}</Text>
          <Text style={styles.statLabel}>Visited</Text>
        </View>
        <View style={styles.statBox}>
          <MapPin size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{NYC_ATTRACTIONS.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton} onPress={() => router.push('/(tabs)/(profile)/friends')}>
          <Text style={styles.socialButtonText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => router.push('/(tabs)/(profile)/requests')}>
          <Text style={styles.socialButtonText}>Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => router.push('/(tabs)/(profile)/circles')}>
          <Text style={styles.socialButtonText}>Circles</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'favorites' && styles.tabActive]}
          onPress={() => setSelectedTab('favorites')}
        >
          <Heart
            size={20}
            color={selectedTab === 'favorites' ? '#FF3B30' : '#999'}
            fill={selectedTab === 'favorites' ? '#FF3B30' : 'none'}
          />
          <Text style={[styles.tabText, selectedTab === 'favorites' && styles.tabTextActive]}>
            Favorites
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'visited' && styles.tabActive]}
          onPress={() => setSelectedTab('visited')}
        >
          <CheckCircle2
            size={20}
            color={selectedTab === 'visited' ? '#34C759' : '#999'}
          />
          <Text style={[styles.tabText, selectedTab === 'visited' && styles.tabTextActive]}>
            Visited
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {displayAttractions.length === 0 ? (
          <View style={styles.emptyState}>
            {selectedTab === 'favorites' ? (
              <>
                <Heart size={64} color="#E5E5E5" />
                <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                <Text style={styles.emptyText}>
                  Start exploring and save your favorite attractions
                </Text>
              </>
            ) : (
              <>
                <MapPin size={64} color="#E5E5E5" />
                <Text style={styles.emptyTitle}>No Visits Yet</Text>
                <Text style={styles.emptyText}>
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
                style={styles.attractionCard}
                onPress={() => viewAttractionDetails(item.attraction_id)}
              >
                <Image
                  source={{ uri: attraction.imageUrl }}
                  style={styles.attractionImage}
                  contentFit="cover"
                />
                <View style={styles.attractionInfo}>
                  <View style={styles.attractionHeader}>
                    <Text style={styles.attractionName}>{attraction.name}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {attraction.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.attractionDescription} numberOfLines={2}>
                    {attraction.description}
                  </Text>
                  <View style={styles.attractionFooter}>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.ratingText}>4.5</Text>
                    </View>
                    {selectedTab === 'favorites' && (
                      <TouchableOpacity
                        style={styles.removeButton}
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
                        <Calendar size={14} color="#666" />
                        <Text style={styles.visitedDateText}>Visited</Text>
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
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  contactInfo: {
    backgroundColor: '#FFF',
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
    color: '#333',
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  socialButtonText: {
    color: '#1a1a1a',
    fontWeight: '700' as const,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
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
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600' as const,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
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
  tabActive: {
    backgroundColor: '#F5F7FA',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#999',
  },
  tabTextActive: {
    color: '#1a1a1a',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  attractionCard: {
    backgroundColor: '#FFF',
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
    color: '#1a1a1a',
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  attractionDescription: {
    fontSize: 14,
    color: '#666',
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
    color: '#333',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
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
    color: '#666',
  },
});
