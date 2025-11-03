import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocial } from '@/lib/social-context';
import { Plus, Users } from 'lucide-react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function ChatsHome() {
  const { chats, friends, createChat } = useSocial();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const colors = useThemeColors();

  const filtered = useMemo(() => {
    return chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [chats, search]);

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.search, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Search chats"
          placeholderTextColor={colors.secondaryText}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          accessibilityRole="button"
          testID="new-chat"
          style={[styles.newButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            const id = createChat('New Chat', friends.map(f => f.id));
            router.push(`/chats/${id}`);
          }}
        >
          <Plus size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.chatItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(`/chats/${item.id}`)}>
            <View style={[styles.chatAvatar, { backgroundColor: colors.primary + '20' }]}><Users size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.chatName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.chatMeta, { color: colors.secondaryText }]}>{item.members.length} members</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.secondaryText }]}>No chats yet</Text></View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  search: { flex: 1, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1 },
  newButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chatItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chatName: { fontSize: 16, fontWeight: '700' as const },
  chatMeta: { fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: {},
});
