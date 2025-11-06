import { Stack } from 'expo-router';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function ChatsLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: 'Chats',
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Chats' }} />
      <Stack.Screen name="[chatId]" options={{ title: 'Conversation' }} />
    </Stack>
  );
}
