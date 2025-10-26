import { Platform } from 'react-native';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import React from 'react';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapRef = {
  animateToRegion: (region: Region, duration?: number) => void;
};

// WEB: react-map-gl (MapLibre)
let MapGLComponent: any = null;
let SourceComponent: any = null;
let LayerComponent: any = null;
let WebMarkerComponent: any = null;

if (Platform.OS === 'web') {
  const MapGL = require('react-map-gl/maplibre');
  MapGLComponent = MapGL.Map;
  SourceComponent = MapGL.Source;
  LayerComponent = MapGL.Layer;
  WebMarkerComponent = MapGL.Marker;
}

// NATIVE: react-native-maps
let NativeMap: any = null;
let NativeMarker: any = null;
let NativePolyline: any = null;
if (Platform.OS !== 'web') {
  const RNMaps = require('react-native-maps');
  NativeMap = RNMaps.default || RNMaps.MapView;
  NativeMarker = RNMaps.Marker;
  NativePolyline = RNMaps.Polyline;
}

interface MapViewProps {
  children?: React.ReactNode;
  style: any;
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
    const webRef = useRef<any>(null);
    const nativeRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        if (Platform.OS === 'web' && webRef.current) {
          webRef.current.flyTo({
            center: [region.longitude, region.latitude],
            zoom: calculateWebZoom(region.latitudeDelta),
            duration,
          });
        } else if (nativeRef.current) {
          nativeRef.current.animateToRegion(
            {
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            },
            duration,
          );
        }
      },
    }));

    if (Platform.OS === 'web' && MapGLComponent) {
      const initialViewState = initialRegion
        ? {
            longitude: initialRegion.longitude,
            latitude: initialRegion.latitude,
            zoom: calculateWebZoom(initialRegion.latitudeDelta),
            pitch: 60,
            bearing: 0,
          }
        : {
            longitude: -73.9851,
            latitude: 40.7589,
            zoom: 12,
            pitch: 60,
            bearing: 0,
          };

      return (
        <MapGLComponent
          ref={webRef}
          initialViewState={initialViewState}
          style={style}
          mapStyle="https://demotiles.maplibre.org/style.json"
          onLoad={onLoad}
          maxPitch={85}
          terrain={{ source: 'terrainSource', exaggeration: 1.5 }}
        >
          <SourceComponent
            id="terrainSource"
            type="raster-dem"
            url="https://demotiles.maplibre.org/terrain-tiles/tiles.json"
            tileSize={256}
          />
          <LayerComponent
            id="3d-buildings"
            source="composite"
            source-layer="building"
            type="fill-extrusion"
            minzoom={14}
            paint={{
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height'],
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height'],
              ],
              'fill-extrusion-opacity': 0.6,
            }}
          />
          {children}
        </MapGLComponent>
      );
    }

    // Native fallback
    if (NativeMap) {
      const region = initialRegion || {
        latitude: 40.7589,
        longitude: -73.9851,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };

      return (
        <NativeMap
          ref={nativeRef}
          style={style}
          initialRegion={region}
          mapType={mapType}
          showsUserLocation
          showsCompass
          onMapReady={onLoad}
        >
          {children}
        </NativeMap>
      );
    }

    return null;
  },
);

MapView.displayName = 'MapView';

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  onPress?: () => void;
  children?: React.ReactNode;
}

export const Marker = ({ coordinate, onPress, children }: MarkerProps) => {
  if (Platform.OS === 'web' && WebMarkerComponent) {
    return (
      <WebMarkerComponent
        longitude={coordinate.longitude}
        latitude={coordinate.latitude}
        anchor="bottom"
        onClick={(e: any) => {
          e.originalEvent?.stopPropagation?.();
          onPress?.();
        }}
      >
        {children}
      </WebMarkerComponent>
    );
  }

  if (NativeMarker) {
    return (
      <NativeMarker coordinate={coordinate as any} onPress={onPress as any}>
        {children}
      </NativeMarker>
    );
  }

  return null;
};

interface PolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

export const Polyline = ({
  coordinates,
  strokeColor = '#007AFF',
  strokeWidth = 4,
  lineDashPattern,
}: PolylineProps) => {
  if (Platform.OS === 'web' && SourceComponent && LayerComponent) {
    const geojson = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: coordinates.map((c) => [c.longitude, c.latitude]),
      },
    };

    return (
      <SourceComponent id="route" type="geojson" data={geojson}>
        <LayerComponent
          id="route-layer"
          type="line"
          paint={{
            'line-color': strokeColor,
            'line-width': strokeWidth,
            ...(lineDashPattern ? { 'line-dasharray': lineDashPattern } : {}),
          }}
        />
      </SourceComponent>
    );
  }

  if (NativePolyline) {
    return (
      <NativePolyline
        coordinates={coordinates as any}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        lineDashPattern={lineDashPattern as any}
      />
    );
  }

  return null;
};

interface UserLocationMarkerProps {
  coordinate: { latitude: number; longitude: number };
}

export const UserLocationMarker = ({ coordinate }: UserLocationMarkerProps) => {
  if (Platform.OS === 'web' && WebMarkerComponent) {
    return (
      <WebMarkerComponent longitude={coordinate.longitude} latitude={coordinate.latitude} anchor="center">
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#007AFF',
            border: '3px solid white',
            boxShadow: '0 0 10px rgba(0, 122, 255, 0.5)',
          }}
        />
      </WebMarkerComponent>
    );
  }

  if (NativeMarker) {
    return (
      <NativeMarker coordinate={coordinate as any}>
        {/* Simple dot */}
        <></>
      </NativeMarker>
    );
  }

  return null;
};

function calculateWebZoom(latitudeDelta: number) {
  return Math.log2(360 / latitudeDelta) - 1;
}
