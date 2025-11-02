import React from 'react';
import type { ViewStyle } from 'react-native';
import type { Region, MapRef } from './MapComponents.types';

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

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  onPress?: () => void;
  children?: React.ReactNode;
}

interface PolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

interface UserLocationMarkerProps {
  coordinate: { latitude: number; longitude: number };
}

export const MapView: React.ForwardRefExoticComponent<MapViewProps & React.RefAttributes<MapRef>>;
export const Marker: React.FC<MarkerProps>;
export const Polyline: React.FC<PolylineProps>;
export const UserLocationMarker: React.FC<UserLocationMarkerProps>;
