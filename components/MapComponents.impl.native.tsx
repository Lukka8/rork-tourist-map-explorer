import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, ViewStyle, Text, StyleSheet, ActivityIndicator } from 'react-native';
import RNMapView, { Marker as RNMarker, Polyline as RNPolyline, Region as RNRegion } from 'react-native-maps';
import { ChevronUp } from 'lucide-react-native';
import type { Region, MapRef } from './MapComponents.types';

interface MapViewProps {
  children?: React.ReactNode;
  style: ViewStyle | { [key: string]: unknown };
  initialRegion?: Region;
  mapType?: 'standard' | 'satellite' | 'hybrid';
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  showsTraffic?: boolean;
  provider?: any;
  onLoad?: () => void;
  onRegionChangeComplete?: (region: Region) => void;
}

export const MapView = forwardRef<MapRef, MapViewProps>(
  ({ children, style, initialRegion, mapType = 'standard', showsTraffic = false, onLoad, onRegionChangeComplete }, ref) => {
    const mapRef = useRef<RNMapView | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        mapRef.current?.animateToRegion(region as RNRegion, duration);
      },
    }));

    const region: RNRegion = (initialRegion || {
      latitude: 40.7589,
      longitude: -73.9851,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    }) as RNRegion;

    const handleMapReady = () => {
      console.log('[MapView Native] Map ready');
      setIsMapReady(true);
      onLoad?.();
    };

    return (
      <View style={[localStyles.container, style]}>
        <RNMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          mapType={mapType}
          showsUserLocation
          showsCompass
          showsTraffic={showsTraffic}
          onMapReady={handleMapReady}
          onRegionChangeComplete={onRegionChangeComplete as any}
        >
          {children}
        </RNMapView>
        
        {!isMapReady && (
          <View style={localStyles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={localStyles.loadingText}>Loading map...</Text>
          </View>
        )}
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

export const Marker = ({ coordinate, onPress, children }: MarkerProps) => (
  <RNMarker coordinate={coordinate as any} onPress={onPress as any}>
    {children}
  </RNMarker>
);

interface PolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

export const Polyline = ({ coordinates, strokeColor = '#007AFF', strokeWidth = 4, lineDashPattern }: PolylineProps) => (
  <RNPolyline
    coordinates={coordinates as any}
    strokeColor={strokeColor}
    strokeWidth={strokeWidth}
    lineDashPattern={lineDashPattern as any}
  />
);

interface UserLocationMarkerProps {
  coordinate: { latitude: number; longitude: number };
  heading?: number;
}

export const UserLocationMarker = ({ coordinate, heading }: UserLocationMarkerProps) => (
  <RNMarker coordinate={coordinate as any} anchor={{ x: 0.5, y: 0.5 }}>
    <View style={userLocationStyles.container}>
      <View 
        style={[
          userLocationStyles.arrowContainer,
          heading !== undefined && { transform: [{ rotate: `${heading}deg` }] }
        ]}
      >
        <ChevronUp size={20} color="#FFF" strokeWidth={3} />
      </View>
      <View style={userLocationStyles.pulse} />
      <View style={userLocationStyles.dot} />
    </View>
  </RNMarker>
);

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '600' as const,
  },
});

const userLocationStyles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  pulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    zIndex: 0,
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
});
