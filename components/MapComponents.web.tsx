import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, ViewStyle, Text, StyleSheet } from 'react-native';
import Map, { Marker as MapGLMarker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

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
    const mapRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const region = initialRegion ?? {
      latitude: 40.7589,
      longitude: -73.9851,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };

    const zoom = calculateWebZoom(region.latitudeDelta);

    useImperativeHandle(ref, () => ({
      animateToRegion: (next: Region, duration = 500) => {
        if (mapRef.current) {
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
});
