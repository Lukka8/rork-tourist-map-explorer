import { Platform } from 'react-native';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import React from "react";

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapRef = {
  animateToRegion: (region: Region, duration?: number) => void;
};

let MapGLComponent: any = null;
let SourceComponent: any = null;
let LayerComponent: any = null;
let MarkerComponent: any = null;

if (Platform.OS === 'web') {
  const MapGL = require('react-map-gl/maplibre');
  MapGLComponent = MapGL.Map;
  SourceComponent = MapGL.Source;
  LayerComponent = MapGL.Layer;
  MarkerComponent = MapGL.Marker;
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
  ({ children, style, initialRegion, onLoad }, ref) => {
    const mapRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        if (mapRef.current && Platform.OS === 'web') {
          mapRef.current.flyTo({
            center: [region.longitude, region.latitude],
            zoom: calculateZoom(region.latitudeDelta),
            duration: duration,
          });
        }
      },
    }));

    const calculateZoom = (latitudeDelta: number) => {
      return Math.log2(360 / latitudeDelta) - 1;
    };

    if (Platform.OS !== 'web' || !MapGLComponent) {
      return null;
    }

    const initialViewState = initialRegion
      ? {
          longitude: initialRegion.longitude,
          latitude: initialRegion.latitude,
          zoom: calculateZoom(initialRegion.latitudeDelta),
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
        ref={mapRef}
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
);

MapView.displayName = 'MapView';

interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  onPress?: () => void;
  children?: React.ReactNode;
}

export const Marker = ({ coordinate, onPress, children }: MarkerProps) => {
  if (Platform.OS !== 'web' || !MarkerComponent) {
    return null;
  }

  return (
    <MarkerComponent
      longitude={coordinate.longitude}
      latitude={coordinate.latitude}
      anchor="bottom"
      onClick={(e: any) => {
        e.originalEvent.stopPropagation();
        onPress?.();
      }}
    >
      {children}
    </MarkerComponent>
  );
};

interface PolylineProps {
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

export const Polyline = ({
  coordinates,
  strokeColor = '#007AFF',
  strokeWidth = 4,
}: PolylineProps) => {
  if (Platform.OS !== 'web' || !SourceComponent || !LayerComponent) {
    return null;
  }

  const geojson = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: coordinates.map((coord) => [coord.longitude, coord.latitude]),
    },
  };

  return (
    <>
      <SourceComponent id="route" type="geojson" data={geojson}>
        <LayerComponent
          id="route-layer"
          type="line"
          paint={{
            'line-color': strokeColor,
            'line-width': strokeWidth,
            'line-dasharray': [2, 2],
          }}
        />
      </SourceComponent>
    </>
  );
};

interface UserLocationMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export const UserLocationMarker = ({ coordinate }: UserLocationMarkerProps) => {
  if (Platform.OS !== 'web' || !MarkerComponent) {
    return null;
  }

  return (
    <MarkerComponent
      longitude={coordinate.longitude}
      latitude={coordinate.latitude}
      anchor="center"
    >
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
    </MarkerComponent>
  );
};
