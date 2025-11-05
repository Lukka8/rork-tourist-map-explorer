import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, ViewStyle, Text, StyleSheet, ActivityIndicator } from 'react-native';
import RNMapView, { Marker as RNMarker, Polyline as RNPolyline, Region as RNRegion } from 'react-native-maps';
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
}

export const MapView = forwardRef<MapRef, MapViewProps>(
  ({ children, style, initialRegion, mapType = 'standard', showsTraffic = false, onLoad }, ref) => {
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
}

export const UserLocationMarker = ({ coordinate }: UserLocationMarkerProps) => (
  <RNMarker coordinate={coordinate as any}>
    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#007AFF', borderWidth: 2, borderColor: '#fff' }} />
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
