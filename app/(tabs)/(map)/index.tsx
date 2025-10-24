import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import { MapPin, X, Navigation, Layers, Heart, Search, Filter, Star, CheckCircle2 } from 'lucide-react-native';
import { NYC_ATTRACTIONS, Attraction } from '@/constants/attractions';
import { StatusBar } from 'expo-status-bar';
import { MapView, Marker, Polyline, UserLocationMarker, type Region as MapRegion, type MapRef } from '@/components/MapComponents';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';

const { height } = Dimensions.get('window');

interface LocationCoords {
  latitude: number;
  longitude: number;
}



export default function MapScreen() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  
  console.log('[MapScreen] Render - isAuthenticated:', isAuthenticated, 'isAuthLoading:', isAuthLoading);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const favoritesQuery = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const visitedQuery = trpc.visited.list.useQuery(undefined, { enabled: isAuthenticated });
  const addFavoriteMutation = trpc.favorites.add.useMutation();
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();
  const addVisitedMutation = trpc.visited.add.useMutation();

  const favorites = favoritesQuery.data?.favorites || [];
  const visited = visitedQuery.data?.visited || [];

  const isFavorite = (attractionId: string) => 
    favorites.some(f => f.attraction_id === attractionId);
  
  const isVisited = (attractionId: string) => 
    visited.some(v => v.attraction_id === attractionId);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getAttractionDistance = (attraction: Attraction) => {
    if (!userLocation) return null;
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      attraction.coordinate.latitude,
      attraction.coordinate.longitude
    );
  };

  const filteredAttractions = NYC_ATTRACTIONS.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attraction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || attraction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const distA = getAttractionDistance(a) || Infinity;
    const distB = getAttractionDistance(b) || Infinity;
    return distA - distB;
  });

  const mapRef = useRef<MapRef>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    console.log('[MapScreen] Auth effect - isAuthLoading:', isAuthLoading, 'isAuthenticated:', isAuthenticated);
    
    if (!isAuthLoading && !isAuthenticated) {
      console.log('[MapScreen] Not authenticated, redirecting to login');
      router.replace('/login');
      return;
    }
    
    if (isAuthenticated) {
      console.log('[MapScreen] Authenticated, requesting location permission');
      requestLocationPermission();
    }
  }, [isAuthenticated, isAuthLoading]);

  const requestLocationPermission = async () => {
    try {
      console.log('[MapScreen] Requesting location permission');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[MapScreen] Location permission status:', status);
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        console.log('[MapScreen] Getting current position');
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        console.log('[MapScreen] Got location:', location.coords);
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          (location) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        );
      }
    } catch (error) {
      console.error('[MapScreen] Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to get location permissions');
    } finally {
      setIsLoadingLocation(false);
      console.log('[MapScreen] Location loading complete');
    }
  };

  const handleMarkerPress = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setShowDirections(false);
    
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    mapRef.current?.animateToRegion({
      ...attraction.coordinate,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 500);
  };

  const closeCard = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedAttraction(null);
      setShowDirections(false);
    });
  };

  const handleGetDirections = () => {
    setShowDirections(true);
    
    if (userLocation && selectedAttraction) {
      const minLat = Math.min(userLocation.latitude, selectedAttraction.coordinate.latitude);
      const maxLat = Math.max(userLocation.latitude, selectedAttraction.coordinate.latitude);
      const minLng = Math.min(userLocation.longitude, selectedAttraction.coordinate.longitude);
      const maxLng = Math.max(userLocation.longitude, selectedAttraction.coordinate.longitude);
      
      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.5;
      const lngDelta = (maxLng - minLng) * 1.5;

      mapRef.current?.animateToRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(latDelta, 0.02),
        longitudeDelta: Math.max(lngDelta, 0.02),
      }, 1000);
    }
  };

  const centerOnUser = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  const toggleMapType = () => {
    setMapType((prev) => {
      if (prev === 'standard') return 'satellite';
      if (prev === 'satellite') return 'hybrid';
      return 'standard';
    });
  };

  const toggleFavorite = async (attractionId: string) => {
    if (isFavorite(attractionId)) {
      await removeFavoriteMutation.mutateAsync({ attractionId });
      favoritesQuery.refetch();
    } else {
      await addFavoriteMutation.mutateAsync({ attractionId });
      favoritesQuery.refetch();
    }
  };

  const toggleVisited = async (attractionId: string) => {
    if (!isVisited(attractionId)) {
      await addVisitedMutation.mutateAsync({ attractionId });
      visitedQuery.refetch();
    }
  };

  const viewAttractionDetails = () => {
    if (selectedAttraction) {
      router.push(`/${selectedAttraction.id}` as any);
    }
  };

  if (isAuthLoading || isLoadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (locationPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <MapPin size={64} color="#999" />
        <Text style={styles.errorTitle}>Location Permission Needed</Text>
        <Text style={styles.errorText}>
          Please enable location permissions to explore nearby attractions
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestLocationPermission}>
          <Text style={styles.retryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialRegion: MapRegion = userLocation
    ? {
        ...userLocation,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }
    : {
        latitude: 40.7589,
        longitude: -73.9851,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };

  const renderMap = () => {
    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        provider={undefined}
      >
        {userLocation && <UserLocationMarker coordinate={userLocation} />}
        
        {filteredAttractions.map((attraction) => (
          <Marker
            key={attraction.id}
            coordinate={attraction.coordinate}
            onPress={() => handleMarkerPress(attraction)}
          >
            <View style={[
              styles.markerContainer,
              selectedAttraction?.id === attraction.id && styles.markerSelected
            ]}>
              <MapPin
                size={28}
                color={selectedAttraction?.id === attraction.id ? '#FF6B6B' : '#007AFF'}
                fill={selectedAttraction?.id === attraction.id ? '#FF6B6B' : '#007AFF'}
              />
            </View>
          </Marker>
        ))}

        {showDirections && userLocation && selectedAttraction && (
          <Polyline
            coordinates={[userLocation, selectedAttraction.coordinate]}
            strokeColor="#007AFF"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}
      </MapView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {renderMap()}

      <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
            <Navigation size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
            <Layers size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Explore NYC</Text>
            <Text style={styles.headerSubtitle}>
              {filteredAttractions.length} {filteredAttractions.length === 1 ? 'attraction' : 'attractions'} found
            </Text>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search attractions..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showFilters && styles.filterButtonActive]} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? '#FFF' : '#007AFF'} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {['all', 'landmark', 'museum', 'park', 'cultural'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {selectedAttraction && (
        <Animated.View
          style={[
            styles.cardContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.card}>
            <TouchableOpacity style={styles.closeButton} onPress={closeCard}>
              <X size={24} color="#333" />
            </TouchableOpacity>

            <Image
              source={{ uri: selectedAttraction.imageUrl }}
              style={styles.cardImage}
              contentFit="cover"
            />

            <ScrollView style={styles.cardContent} showsVerticalScrollIndicator={false}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {selectedAttraction.category.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.cardTitle}>{selectedAttraction.name}</Text>
              
              <View style={styles.statsRow}>
                {userLocation && (
                  <View style={styles.statItem}>
                    <Navigation size={16} color="#007AFF" />
                    <Text style={styles.statText}>
                      {getAttractionDistance(selectedAttraction)?.toFixed(1)} km
                    </Text>
                  </View>
                )}
                <View style={styles.statItem}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.statText}>4.5</Text>
                </View>
                {isVisited(selectedAttraction.id) && (
                  <View style={styles.visitedBadge}>
                    <CheckCircle2 size={16} color="#34C759" />
                    <Text style={styles.visitedText}>Visited</Text>
                  </View>
                )}
              </View>

              <View style={styles.factContainer}>
                <View style={styles.factIcon}>
                  <Text style={styles.factEmoji}>💡</Text>
                </View>
                <Text style={styles.factText}>{selectedAttraction.fact}</Text>
              </View>

              <Text style={styles.cardDescription}>
                {selectedAttraction.description}
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.favoriteButton, isFavorite(selectedAttraction.id) && styles.favoriteButtonActive]}
                  onPress={() => toggleFavorite(selectedAttraction.id)}
                >
                  <Heart 
                    size={20} 
                    color={isFavorite(selectedAttraction.id) ? '#FFF' : '#FF3B30'}
                    fill={isFavorite(selectedAttraction.id) ? '#FFF' : 'none'}
                  />
                  <Text style={[styles.actionButtonText, isFavorite(selectedAttraction.id) && styles.actionButtonTextActive]}>
                    {isFavorite(selectedAttraction.id) ? 'Saved' : 'Save'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.visitedButton, isVisited(selectedAttraction.id) && styles.visitedButtonActive]}
                  onPress={() => toggleVisited(selectedAttraction.id)}
                  disabled={isVisited(selectedAttraction.id)}
                >
                  <CheckCircle2 
                    size={20} 
                    color={isVisited(selectedAttraction.id) ? '#FFF' : '#34C759'}
                  />
                  <Text style={[styles.actionButtonText, isVisited(selectedAttraction.id) && styles.actionButtonTextActive]}>
                    {isVisited(selectedAttraction.id) ? 'Visited' : 'Check In'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.directionsButton}
                onPress={handleGetDirections}
              >
                <Navigation size={20} color="#FFF" />
                <Text style={styles.directionsButtonText}>
                  {showDirections ? 'Showing Route' : 'Get Directions'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={viewAttractionDetails}
              >
                <Star size={20} color="#007AFF" />
                <Text style={styles.detailsButtonText}>
                  View Reviews & Details
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#007AFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    gap: 12,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  markerContainer: {
    padding: 4,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerSelected: {
    backgroundColor: '#FFF',
    transform: [{ scale: 1.2 }],
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 220,
  },
  cardContent: {
    flex: 1,
    padding: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  factContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE89E',
  },
  factIcon: {
    marginRight: 12,
  },
  factEmoji: {
    fontSize: 24,
  },
  factText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#B8860B',
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  directionsButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  detailsButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryFilter: {
    marginTop: 12,
    maxHeight: 40,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  visitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  visitedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#34C759',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    borderWidth: 2,
  },
  favoriteButton: {
    backgroundColor: '#FFF',
    borderColor: '#FF3B30',
  },
  favoriteButtonActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  visitedButton: {
    backgroundColor: '#FFF',
    borderColor: '#34C759',
  },
  visitedButtonActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#333',
  },
  actionButtonTextActive: {
    color: '#FFF',
  },
});
