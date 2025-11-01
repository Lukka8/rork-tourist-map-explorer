export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapRef = {
  animateToRegion: (region: Region, duration?: number) => void;
};
