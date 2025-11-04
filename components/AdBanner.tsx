import { View, Text, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

interface AdBannerProps {
  size?: 'banner' | 'large-banner' | 'medium-rectangle';
}

export function AdBanner({ size = 'banner' }: AdBannerProps) {
  const colors = useThemeColors();

  const getAdHeight = () => {
    switch (size) {
      case 'banner':
        return 50;
      case 'large-banner':
        return 100;
      case 'medium-rectangle':
        return 250;
      default:
        return 50;
    }
  };

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <View style={[styles.adContainer, { height: getAdHeight(), backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.adLabel, { color: colors.secondaryText }]}>Advertisement</Text>
      <Text style={[styles.adPlaceholder, { color: colors.secondaryText }]}>
        Ad Space ({size})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  adLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    marginBottom: 4,
    opacity: 0.6,
  },
  adPlaceholder: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
});
