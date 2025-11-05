import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

type AdSize = 'banner' | 'large-banner' | 'medium-rectangle' | 'full-banner';

interface AdBannerProps {
  size?: AdSize;
}

const AD_SIZES = {
  banner: { width: 320, height: 50 },
  'large-banner': { width: 320, height: 100 },
  'medium-rectangle': { width: 300, height: 250 },
  'full-banner': { width: 468, height: 60 },
} as const;

export function AdBanner({ size = 'banner' }: AdBannerProps) {
  const colors = useThemeColors();
  const dimensions = AD_SIZES[size];

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.adBackground,
          borderColor: colors.border,
          width: dimensions.width,
          height: dimensions.height,
        }
      ]}
    >
      <Text style={[styles.text, { color: colors.secondaryText }]}>
        Ad Placeholder
      </Text>
      <Text style={[styles.sizeText, { color: colors.secondaryText }]}>
        {size} ({dimensions.width}x{dimensions.height})
      </Text>
      <Text style={[styles.infoText, { color: colors.secondaryText }]}>
        Testing Mode
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed' as const,
    gap: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sizeText: {
    fontSize: 12,
  },
  infoText: {
    fontSize: 10,
    fontStyle: 'italic' as const,
  },
});
