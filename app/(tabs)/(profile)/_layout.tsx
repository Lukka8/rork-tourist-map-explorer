import { Stack } from 'expo-router';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function ProfileLayout() {
  const colors = useThemeColors();
  
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.text,
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="friends" options={{ headerShown: true, title: 'Friends' }} />
      <Stack.Screen name="requests" options={{ headerShown: true, title: 'Friend Requests' }} />
      <Stack.Screen name="circles" options={{ headerShown: true, title: 'Circles' }} />
      <Stack.Screen name="lists" options={{ headerShown: true, title: 'My Lists' }} />
      <Stack.Screen name="account" options={{ headerShown: true, title: 'Account' }} />
    </Stack>
  );
}
