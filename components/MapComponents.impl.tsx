import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, ViewStyle, StyleSheet, Text } from 'react-native';
import Map, { Marker as MapGLMarker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
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



export const MapView = forwardRef<MapRef, MapViewProps>(
  ({ children, style, initialRegion, mapType = 'standard', onLoad }, ref) => {
    const mapRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    const region = initialRegion ?? {
      latitude: 40.7589,
      longitude: -73.9851,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };

    const zoom = calculateWebZoom(region.latitudeDelta);

    useImperativeHandle(ref, () => ({
      animateToRegion: (next: Region, duration = 500) => {
        if (mapRef.current && !mapError) {
          const nextZoom = calculateWebZoom(next.latitudeDelta);
          mapRef.current.flyTo({
            center: [next.longitude, next.latitude],
            zoom: nextZoom,
            duration,
          });
        }
      },
    }));

    useEffect(() => {
      if (mapLoaded) {
        onLoad?.();
      }
    }, [mapLoaded, onLoad]);

    const mapStyle = mapType === 'satellite' 
      ? 'https://demotiles.maplibre.org/style.json'
      : 'https://demotiles.maplibre.org/style.json';

    const handleMapError = (event: any) => {
      console.error('[MapView Web] Map error:', event);
      setMapError('Interactive map is not available. Please use a device or enable WebGL in your browser.');
    };

    if (mapError) {
      return (
        <View style={[styles.container, style]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Map Unavailable</Text>
            <Text style={styles.errorText}>{mapError}</Text>
            <Text style={styles.errorHint}>For interactive map experience, please:</Text>
            <Text style={styles.errorHintItem}>• Scan the QR code to open on your device</Text>
            <Text style={styles.errorHintItem}>• Enable WebGL in your browser settings</Text>
            <View style={styles.staticMapContainer}>
              <Text style={styles.staticMapText}>📍 {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, style]}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: region.longitude,
            latitude: region.latitude,
            zoom,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapStyle}
          onLoad={() => setMapLoaded(true)}
          onError={handleMapError}
        >
          <NavigationControl position="top-right" />
          {children}
        </Map>
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
  <MapGLMarker
    longitude={coordinate.longitude}
    latitude={coordinate.latitude}
    anchor="bottom"
    onClick={(e) => {
      e.originalEvent.stopPropagation();
      onPress?.();
    }}
  >
    {children || <div style={{ 
      width: 32, 
      height: 32, 
      backgroundColor: '#007AFF', 
      borderRadius: '50%', 
      border: '3px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }} />}
  </MapGLMarker>
);

interface PolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

export const Polyline = ({ coordinates, strokeColor = '#007AFF', strokeWidth = 4 }: PolylineProps) => {
  const geojson = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: coordinates.map(c => [c.longitude, c.latitude]),
    },
  };

  return (
    <Source id="route" type="geojson" data={geojson}>
      <Layer
        id="route-layer"
        type="line"
        paint={{
          'line-color': strokeColor,
          'line-width': strokeWidth,
        }}
      />
    </Source>
  );
};

interface UserLocationMarkerProps {
  coordinate: { latitude: number; longitude: number };
}

export const UserLocationMarker = ({ coordinate }: UserLocationMarkerProps) => (
  <MapGLMarker
    longitude={coordinate.longitude}
    latitude={coordinate.latitude}
    anchor="center"
  >
    <div style={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      backgroundColor: '#007AFF',
      border: '3px solid white',
      boxShadow: '0 0 0 8px rgba(0, 122, 255, 0.3)'
    }} />
  </MapGLMarker>
);

function calculateWebZoom(latitudeDelta: number) {
  const value = Math.log2(360 / Math.max(latitudeDelta, 0.00001));
  return Math.max(1, Math.min(18, Math.round(value)));
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorHintItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  staticMapContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  staticMapText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600' as const,
  },
});
