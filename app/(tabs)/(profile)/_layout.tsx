import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="friends" options={{ headerShown: true, title: 'Friends' }} />
      <Stack.Screen name="requests" options={{ headerShown: true, title: 'Friend Requests' }} />
      <Stack.Screen name="circles" options={{ headerShown: true, title: 'Circles' }} />
    </Stack>
  );
}
