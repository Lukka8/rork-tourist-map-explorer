import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X, Gift } from 'lucide-react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

interface AdRewardedProps {
  visible: boolean;
  onClose: () => void;
  onRewarded: () => void;
  rewardAmount?: number;
  rewardType?: string;
}

const { width } = Dimensions.get('window');

export function AdRewarded({
  visible,
  onClose,
  onRewarded,
  rewardAmount = 10,
  rewardType = 'coins',
}: AdRewardedProps) {
  const colors = useThemeColors();
  const [countdown, setCountdown] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRewarded, setHasRewarded] = useState(false);

  useEffect(() => {
    if (visible) {
      setCountdown(10);
      setIsLoading(true);
      setHasRewarded(false);
      
      const loadTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(loadTimer);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && !isLoading && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (countdown === 0 && !hasRewarded) {
      setHasRewarded(true);
      onRewarded();
    }
  }, [visible, isLoading, countdown, hasRewarded, onRewarded]);

  if (Platform.OS === 'web') {
    return null;
  }

  const handleClose = () => {
    if (countdown === 0 || hasRewarded) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.adContainer, { backgroundColor: colors.card }]}>
          {(countdown === 0 || hasRewarded) && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              onPress={handleClose}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Loading ad...
              </Text>
            </View>
          ) : hasRewarded ? (
            <View style={styles.content}>
              <View style={[styles.rewardCircle, { backgroundColor: colors.success + '20' }]}>
                <Gift size={48} color={colors.success} />
              </View>
              <Text style={[styles.rewardTitle, { color: colors.text }]}>
                Congratulations!
              </Text>
              <Text style={[styles.rewardAmount, { color: colors.success }]}>
                +{rewardAmount} {rewardType}
              </Text>
              <Text style={[styles.rewardDescription, { color: colors.secondaryText }]}>
                Your reward has been added
              </Text>
              <TouchableOpacity
                style={[styles.claimButton, { backgroundColor: colors.success }]}
                onPress={handleClose}
              >
                <Text style={styles.claimButtonText}>Claim Reward</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.content}>
              <Text style={[styles.adLabel, { color: colors.secondaryText }]}>
                Rewarded Advertisement
              </Text>
              <View style={[styles.rewardPreview, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                <Gift size={32} color={colors.primary} />
                <Text style={[styles.rewardPreviewText, { color: colors.primary }]}>
                  +{rewardAmount} {rewardType}
                </Text>
              </View>
              <Text style={[styles.adTitle, { color: colors.text }]}>
                Watch to Earn
              </Text>
              <Text style={[styles.adDescription, { color: colors.secondaryText }]}>
                Watch this ad to receive your reward
              </Text>

              <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBar,
                    { 
                      backgroundColor: colors.primary,
                      width: `${((10 - countdown) / 10) * 100}%`
                    },
                  ]}
                />
              </View>

              <Text style={[styles.countdownText, { color: colors.secondaryText }]}>
                {countdown}s remaining
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adContainer: {
    width: width * 0.9,
    maxWidth: 400,
    minHeight: 450,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 24,
    opacity: 0.6,
  },
  rewardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
  },
  rewardPreviewText: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  adTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 12,
  },
  adDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  rewardCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  rewardTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  rewardDescription: {
    fontSize: 16,
    marginBottom: 32,
  },
  claimButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
