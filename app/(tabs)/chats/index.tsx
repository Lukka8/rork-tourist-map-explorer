import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocial } from '@/lib/social-context';
import { Plus, Users } from 'lucide-react-native';

export default function ChatsHome() {
  const { chats, friends, createChat } = useSocial();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [chats, search]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search chats"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          accessibilityRole="button"
          testID="new-chat"
          style={styles.newButton}
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
          <TouchableOpacity style={styles.chatItem} onPress={() => router.push(`/chats/${item.id}`)}>
            <View style={styles.chatAvatar}><Users size={20} color="#007AFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatMeta}>{item.members.length} members</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}><Text style={styles.emptyText}>No chats yet</Text></View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  search: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#E5E5E5' },
  newButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  chatItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EEE' },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F4FF', alignItems: 'center', justifyContent: 'center' },
  chatName: { fontSize: 16, fontWeight: '700' as const, color: '#1a1a1a' },
  chatMeta: { fontSize: 12, color: '#666' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#999' },
});
