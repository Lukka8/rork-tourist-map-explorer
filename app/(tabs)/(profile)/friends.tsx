import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useSocial } from '@/lib/social-context';
import { UserPlus } from 'lucide-react-native';

export default function FriendsScreen() {
  const { friends, sendFriendRequest, toggleShareLocation } = useSocial();
  const [username, setUsername] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add by username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => { if (username.trim()) { sendFriendRequest(username.trim()); setUsername(''); } }}>
          <UserPlus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.name[0] ?? 'U'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>Share location</Text>
              <Switch value={!!item.locationSharing} onValueChange={(v) => toggleShareLocation(item.id, v)} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (<View style={{ alignItems: 'center', marginTop: 40 }}><Text style={{ color: '#999' }}>No friends yet</Text></View>)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 12, backgroundColor: '#FFF' },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  friendItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EEE' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F4FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#007AFF', fontWeight: '800' as const },
  name: { fontSize: 16, fontWeight: '700' as const, color: '#1a1a1a' },
  username: { fontSize: 12, color: '#666' },
});
