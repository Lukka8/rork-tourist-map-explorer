import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useThemeColors } from '@/lib/use-theme-colors';
import {
  Star,
  Heart,
  CheckCircle2,
  MapPin,
  User,
  Send,
} from 'lucide-react-native';
import { NYC_ATTRACTIONS, TBILISI_ATTRACTIONS } from '@/constants/attractions';
import { useAttractions } from '@/lib/attractions-context';

export default function AttractionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const colors = useThemeColors();
  const attractions = useAttractions();
  const { isFavorite, isVisited, addFavorite, removeFavorite, addVisited } = attractions;

  const attraction = [...NYC_ATTRACTIONS, ...TBILISI_ATTRACTIONS].find((a) => a.id === id);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  if (!attraction) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.secondaryBackground }]}>
        <Text style={[styles.errorText, { color: colors.secondaryText }]}>Attraction not found</Text>
      </View>
    );
  }

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    const newReview = {
      id: Date.now(),
      user_id: 1,
      attraction_id: id as string,
      rating,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
      user_name: 'Demo User',
    };
    
    setReviews([...reviews, newReview]);
    setComment('');
    setRating(5);
    Alert.alert('Success', 'Review submitted successfully!');
  };

  const toggleFavorite = async () => {
    if (isFavorite(id as string)) {
      await removeFavorite(id as string);
    } else {
      await addFavorite(id as string);
    }
  };

  const toggleVisited = async () => {
    if (!isVisited(id as string)) {
      await addVisited(id as string);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: attraction.name,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: '700' as const,
          },
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.secondaryBackground }]}
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

            <Text style={[styles.title, { color: colors.text }]}>{attraction.name}</Text>

            <View style={styles.statsRow}>
              <View style={styles.ratingContainer}>
                <Star size={20} color="#FFD700" fill="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
                </Text>
                <Text style={[styles.reviewCount, { color: colors.secondaryText }]}>
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </Text>
              </View>
              {isVisited(id as string) && (
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

            <Text style={[styles.description, { color: colors.secondaryText }]}>{attraction.description}</Text>

            <View style={[styles.locationContainer, { backgroundColor: colors.primary + '20' }]}>
              <MapPin size={20} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {attraction.coordinate.latitude.toFixed(4)}, {attraction.coordinate.longitude.toFixed(4)}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.favoriteButton, isFavorite(id as string) && styles.favoriteButtonActive]}
                onPress={toggleFavorite}
              >
                <Heart
                  size={20}
                  color={isFavorite(id as string) ? '#FFF' : '#FF3B30'}
                  fill={isFavorite(id as string) ? '#FFF' : 'none'}
                />
                <Text style={[styles.actionButtonText, isFavorite(id as string) && styles.actionButtonTextActive]}>
                  {isFavorite(id as string) ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.visitedButton, isVisited(id as string) && styles.visitedButtonActive]}
                onPress={toggleVisited}
                disabled={isVisited(id as string)}
              >
                <CheckCircle2
                  size={20}
                  color={isVisited(id as string) ? '#FFF' : '#34C759'}
                />
                <Text style={[styles.actionButtonText, isVisited(id as string) && styles.actionButtonTextActive]}>
                  {isVisited(id as string) ? 'Visited' : 'Check In'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reviewsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>

              <View style={[styles.addReviewCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <Text style={[styles.addReviewTitle, { color: colors.text }]}>Write a Review</Text>

                <View style={styles.starRatingContainer}>
                  <Text style={[styles.starLabel, { color: colors.secondaryText }]}>Your Rating:</Text>
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
                  style={[styles.commentInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="Share your experience..."
                  placeholderTextColor={colors.secondaryText}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                  onPress={handleSubmitReview}
                >
                  <Send size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                </TouchableOpacity>
              </View>

              {reviews.length === 0 ? (
                <View style={styles.emptyReviews}>
                  <Star size={48} color={colors.border} />
                  <Text style={[styles.emptyReviewsText, { color: colors.text }]}>No reviews yet</Text>
                  <Text style={[styles.emptyReviewsSubtext, { color: colors.secondaryText }]}>Be the first to review!</Text>
                </View>
              ) : (
                reviews.map((review: any) => (
                  <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        <View style={[styles.reviewerAvatar, { backgroundColor: colors.primary + '20' }]}>
                          <User size={20} color={colors.primary} />
                        </View>
                        <View>
                          <Text style={[styles.reviewerName, { color: colors.text }]}>
                            {review.user_name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reviewRating}>
                        <Star size={16} color="#FFD700" fill="#FFD700" />
                        <Text style={[styles.reviewRatingText, { color: colors.text }]}>{review.rating}</Text>
                      </View>
                    </View>
                    {review.comment && (
                      <Text style={[styles.reviewComment, { color: colors.text }]}>{review.comment}</Text>
                    )}
                    <Text style={[styles.reviewDate, { color: colors.secondaryText }]}>
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
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
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
  },
  reviewCount: {
    fontSize: 14,
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
    lineHeight: 24,
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 15,
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
    marginBottom: 20,
  },
  addReviewCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  addReviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  starRatingContainer: {
    marginBottom: 16,
  },
  starLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
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
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 16,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '700' as const,
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
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
  },
});
