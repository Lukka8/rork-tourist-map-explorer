import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import {
  Star,
  Heart,
  CheckCircle2,
  MapPin,
  User,
  Send,
} from 'lucide-react-native';
import { NYC_ATTRACTIONS } from '@/constants/attractions';
import { api } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AttractionDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const reviewsQuery = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.reviews.list(id as string),
  });
  
  const addReviewMutation = useMutation({
    mutationFn: (data: { attractionId: string; rating: number; comment?: string }) => 
      api.reviews.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    },
  });
  
  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.favorites.list(),
  });
  
  const visitedQuery = useQuery({
    queryKey: ['visited'],
    queryFn: () => api.visited.list(),
  });
  
  const addFavoriteMutation = useMutation({
    mutationFn: (attractionId: string) => api.favorites.add(attractionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
  
  const removeFavoriteMutation = useMutation({
    mutationFn: (attractionId: string) => api.favorites.remove(attractionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
  
  const addVisitedMutation = useMutation({
    mutationFn: (attractionId: string) => api.visited.add(attractionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visited'] });
    },
  });

  const attraction = NYC_ATTRACTIONS.find((a) => a.id === id);
  const reviews = reviewsQuery.data || [];
  const favorites = favoritesQuery.data || [];
  const visited = visitedQuery.data || [];

  const isFavorite = favorites.includes(id as string);
  const isVisited = visited.includes(id as string);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  if (!attraction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Attraction not found</Text>
      </View>
    );
  }

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      await addReviewMutation.mutateAsync({
        attractionId: id as string,
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setRating(5);
      Alert.alert('Success', 'Review submitted successfully!');
    } catch {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavoriteMutation.mutateAsync(id as string);
      } else {
        await addFavoriteMutation.mutateAsync(id as string);
      }
    } catch {
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const toggleVisited = async () => {
    if (!isVisited) {
      try {
        await addVisitedMutation.mutateAsync(id as string);
      } catch {
        Alert.alert('Error', 'Failed to check in');
      }
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: attraction.name,
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: '700' as const,
          },
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Image
            source={{ uri: attraction.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />

          <View style={styles.content}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {attraction.category.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.title}>{attraction.name}</Text>

            <View style={styles.statsRow}>
              <View style={styles.ratingContainer}>
                <Star size={20} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>
                  {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
                </Text>
                <Text style={styles.reviewCount}>
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </Text>
              </View>
              {isVisited && (
                <View style={styles.visitedBadge}>
                  <CheckCircle2 size={16} color="#34C759" />
                  <Text style={styles.visitedText}>Visited</Text>
                </View>
              )}
            </View>

            <View style={styles.factContainer}>
              <Text style={styles.factEmoji}>💡</Text>
              <Text style={styles.factText}>{attraction.fact}</Text>
            </View>

            <Text style={styles.description}>{attraction.description}</Text>

            <View style={styles.locationContainer}>
              <MapPin size={20} color="#007AFF" />
              <Text style={styles.locationText}>
                {attraction.coordinate.latitude.toFixed(4)}, {attraction.coordinate.longitude.toFixed(4)}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                onPress={toggleFavorite}
              >
                <Heart
                  size={20}
                  color={isFavorite ? '#FFF' : '#FF3B30'}
                  fill={isFavorite ? '#FFF' : 'none'}
                />
                <Text style={[styles.actionButtonText, isFavorite && styles.actionButtonTextActive]}>
                  {isFavorite ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.visitedButton, isVisited && styles.visitedButtonActive]}
                onPress={toggleVisited}
                disabled={isVisited}
              >
                <CheckCircle2
                  size={20}
                  color={isVisited ? '#FFF' : '#34C759'}
                />
                <Text style={[styles.actionButtonText, isVisited && styles.actionButtonTextActive]}>
                  {isVisited ? 'Visited' : 'Check In'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Reviews</Text>

              <View style={styles.addReviewCard}>
                <Text style={styles.addReviewTitle}>Write a Review</Text>

                <View style={styles.starRatingContainer}>
                  <Text style={styles.starLabel}>Your Rating:</Text>
                  <View style={styles.starButtons}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                      >
                        <Star
                          size={32}
                          color="#FFD700"
                          fill={star <= rating ? '#FFD700' : 'none'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your experience..."
                  placeholderTextColor="#999"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitReview}
                  disabled={addReviewMutation.isPending}
                >
                  {addReviewMutation.isPending ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Send size={20} color="#FFF" />
                      <Text style={styles.submitButtonText}>Submit Review</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {reviewsQuery.isLoading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
              ) : reviews.length === 0 ? (
                <View style={styles.emptyReviews}>
                  <Star size={48} color="#E5E5E5" />
                  <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                  <Text style={styles.emptyReviewsSubtext}>Be the first to review!</Text>
                </View>
              ) : (
                reviews.map((review: any) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        <View style={styles.reviewerAvatar}>
                          <User size={20} color="#007AFF" />
                        </View>
                        <View>
                          <Text style={styles.reviewerName}>
                            {review.user_name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reviewRating}>
                        <Star size={16} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.reviewRatingText}>{review.rating}</Text>
                      </View>
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    )}
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
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
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
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
  factEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  factText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#B8860B',
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F4FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600' as const,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
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
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#333',
  },
  actionButtonTextActive: {
    color: '#FFF',
  },
  reviewsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 20,
  },
  addReviewCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addReviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  starRatingContainer: {
    marginBottom: 16,
  },
  starLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 8,
  },
  starButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  loader: {
    marginVertical: 20,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyReviewsText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  reviewerUsername: {
    fontSize: 13,
    color: '#666',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  reviewComment: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
});
