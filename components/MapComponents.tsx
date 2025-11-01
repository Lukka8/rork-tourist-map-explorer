import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, ViewStyle } from 'react-native';
import RNMapView, { Marker as RNMarker, Polyline as RNPolyline, Region as RNRegion } from 'react-native-maps';

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

export const MapView = forwardRef<MapRef, MapViewProps>(
  ({ children, style, initialRegion, mapType = 'standard', onLoad }, ref) => {
    const mapRef = useRef<RNMapView | null>(null);

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

    return (
      <RNMapView
        ref={mapRef}
        style={style as any}
        initialRegion={region}
        mapType={mapType}
        showsUserLocation
        showsCompass
        onMapReady={onLoad}
      >
        {children}
      </RNMapView>
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
