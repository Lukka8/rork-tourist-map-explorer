import { Stack } from 'expo-router';

export default function ChatsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, title: 'Chats' }}>
      <Stack.Screen name="index" options={{ title: 'Chats' }} />
      <Stack.Screen name="[chatId]" options={{ title: 'Conversation' }} />
    </Stack>
  );
}
