import { Platform } from 'react-native';

let MapView: any;
let Marker: any;
let Polyline: any;
let UserLocationMarker: any;

if (Platform.OS === 'web') {
  const webComponents = require('./MapComponents.web');
  MapView = webComponents.MapView;
  Marker = webComponents.Marker;
  Polyline = webComponents.Polyline;
  UserLocationMarker = webComponents.UserLocationMarker;
} else {
  const nativeComponents = require('./MapComponents.native');
  MapView = nativeComponents.MapView;
  Marker = nativeComponents.Marker;
  Polyline = nativeComponents.Polyline;
  UserLocationMarker = nativeComponents.UserLocationMarker;
}

export { MapView, Marker, Polyline, UserLocationMarker };
export type { MapRef, Region } from './MapComponents.types';
