import { Stack } from 'expo-router';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function ActivityLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: 'Activity',
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Activity' }} />
    </Stack>
  );
}
