import { Stack } from 'expo-router';

export default function MapLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ headerShown: true, title: 'Attraction Details' }} />
      <Stack.Screen name="checkin" options={{ headerShown: true, title: 'Check In' }} />
    </Stack>
  );
}
