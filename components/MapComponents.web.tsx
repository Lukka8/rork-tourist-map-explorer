import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ViewStyle } from 'react-native';
import { Map as MapGL, Source, Layer, Marker } from 'react-map-gl/maplibre';

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
  ({ children, style, initialRegion, onLoad }, ref) => {
    const mapRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        try {
          
          mapRef.current?.flyTo({
            center: [region.longitude, region.latitude],
            zoom: calculateWebZoom(region.latitudeDelta),
            duration,
          });
        } catch (e) {
          console.log('[MapView.web] flyTo failed', e);
        }
      },
    }));

    const initialViewState = initialRegion
      ? {
          longitude: initialRegion.longitude,
          latitude: initialRegion.latitude,
          zoom: calculateWebZoom(initialRegion.latitudeDelta),
        }
      : { longitude: -73.9851, latitude: 40.7589, zoom: 12 };

    return (
      <MapGL
        
        style={style as any}
        ref={mapRef as any}
        initialViewState={initialViewState}
        mapStyle="https://demotiles.maplibre.org/style.json"
        onLoad={onLoad}
      >
        {children}
      </MapGL>
    );
  },
);

MapView.displayName = 'MapView';

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  onPress?: () => void;
  children?: React.ReactNode;
}

export const MarkerView = ({ coordinate, onPress, children }: MarkerProps) => (
  <Marker
    longitude={coordinate.longitude}
    latitude={coordinate.latitude}
    anchor="bottom"
    onClick={(e: any) => {
      e.originalEvent?.stopPropagation?.();
      onPress?.();
    }}
  >
    {children}
  </Marker>
);

export { MarkerView as Marker };

interface PolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

export const Polyline = ({ coordinates, strokeColor = '#007AFF', strokeWidth = 4, lineDashPattern }: PolylineProps) => {
  const geojson = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: coordinates.map((c) => [c.longitude, c.latitude]),
    },
  };

  return (
    <Source id="route" type="geojson" data={geojson as any}>
      <Layer
        id="route-layer"
        type="line"
        paint={{
          'line-color': strokeColor,
          'line-width': strokeWidth,
          ...(lineDashPattern ? { 'line-dasharray': lineDashPattern } : {}),
        }}
      />
    </Source>
  );
};

interface UserLocationMarkerProps {
  coordinate: { latitude: number; longitude: number };
}

export const UserLocationMarker = ({ coordinate }: UserLocationMarkerProps) => (
  <Marker longitude={coordinate.longitude} latitude={coordinate.latitude} anchor="center">
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        border: '3px solid #fff',
        boxShadow: '0 0 10px rgba(0,122,255,0.5)',
      }}
    />
  </Marker>
);

function calculateWebZoom(latitudeDelta: number) {
  return Math.log2(360 / latitudeDelta) - 1;
}
