import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

interface AdInterstitialProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export function AdInterstitial({ visible, onClose }: AdInterstitialProps) {
  const colors = useThemeColors();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (visible && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible, countdown]);

  useEffect(() => {
    if (visible) {
      setCountdown(5);
    }
  }, [visible]);

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={countdown === 0 ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <View style={[styles.adContainer, { backgroundColor: colors.card }]}>
          {countdown === 0 && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              onPress={onClose}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          <View style={styles.content}>
            <Text style={[styles.adLabel, { color: colors.secondaryText }]}>
              Advertisement
            </Text>
            <Text style={[styles.adTitle, { color: colors.text }]}>
              Interstitial Ad Placeholder
            </Text>
            <Text style={[styles.adDescription, { color: colors.secondaryText }]}>
              This is where your full-screen ad will appear
            </Text>

            {countdown > 0 ? (
              <View style={[styles.countdownContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.countdownText}>
                  You can close in {countdown}s
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.closeButtonBottom, { backgroundColor: colors.primary }]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Close Ad</Text>
              </TouchableOpacity>
            )}
          </View>
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
    minHeight: 400,
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
  content: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 16,
    opacity: 0.6,
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
  countdownContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  countdownText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  closeButtonBottom: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
