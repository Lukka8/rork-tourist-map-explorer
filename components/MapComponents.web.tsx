import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { View, ViewStyle, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapRef = {
  animateToRegion: (region: Region, duration?: number) => void;
};

interface MapViewProps {
  children?: React.ReactNode;
  style: ViewStyle | { [key: string]: unknown };
  initialRegion?: Region;
  mapType?: 'standard' | 'satellite' | 'hybrid';
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  provider?: any;
  onLoad?: () => void;
}

function buildStaticMapUrl(center: { latitude: number; longitude: number }, zoom: number, width: number, height: number) {
  const lat = center.latitude.toFixed(6);
  const lng = center.longitude.toFixed(6);
  const size = `${Math.min(Math.max(Math.floor(width), 200), 1280)}x${Math.min(Math.max(Math.floor(height), 200), 1280)}`;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=mapnik&markers=${lat},${lng},lightblue1`;
}

export const MapView = forwardRef<MapRef, MapViewProps>(
  ({ children, style, initialRegion, onLoad }, ref) => {
    const [region, setRegion] = useState<Region>(
      initialRegion ?? {
        latitude: 40.7589,
        longitude: -73.9851,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      },
    );

    const [loading, setLoading] = useState<boolean>(true);
    const zoom = useMemo(() => calculateWebZoom(region.latitudeDelta), [region.latitudeDelta]);

    useImperativeHandle(ref, () => ({
      animateToRegion: (next: Region) => {
        setRegion(next);
      },
    }));

    const uri = useMemo(() => buildStaticMapUrl(region, zoom, 800, 600), [region, zoom]);

    return (
      <View style={[styles.container, style]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          onLoadEnd={() => {
            if (loading) setLoading(false);
            onLoad?.();
          }}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading map…</Text>
          </View>
        )}
        {!loading && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Web preview: static map (open on device for interactive map)</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => setRegion({ ...region })} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Children (Marker/Polyline) are no-ops on web to avoid DOM reliance */}
        {children}
      </View>
    );
  },
);

MapView.displayName = 'MapView';

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  onPress?: () => void;
  children?: React.ReactNode;
}

export const Marker = (_props: MarkerProps) => null;

interface PolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

export const Polyline = (_props: PolylineProps) => null;

interface UserLocationMarkerProps {
  coordinate: { latitude: number; longitude: number };
}

export const UserLocationMarker = (_props: UserLocationMarkerProps) => null;

function calculateWebZoom(latitudeDelta: number) {
  const value = Math.log2(360 / Math.max(latitudeDelta, 0.00001));
  return Math.max(1, Math.min(18, Math.round(value)));
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  loadingText: {
    marginTop: 8,
    color: '#333',
  },
  banner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bannerText: {
    flex: 1,
    color: '#333',
  },
  retryBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700' as const,
  },
});
