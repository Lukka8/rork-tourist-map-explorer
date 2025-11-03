import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useSocial } from '@/lib/social-context';
import { UserPlus } from 'lucide-react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function FriendsScreen() {
  const { friends, sendFriendRequest, toggleShareLocation } = useSocial();
  const [username, setUsername] = useState('');
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Add by username"
          placeholderTextColor={colors.secondaryText}
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => { if (username.trim()) { sendFriendRequest(username.trim()); setUsername(''); } }}>
          <UserPlus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <View style={[styles.friendItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{item.name[0] ?? 'U'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.username, { color: colors.secondaryText }]}>@{item.username}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: colors.secondaryText, marginBottom: 4 }}>Share location</Text>
              <Switch value={!!item.locationSharing} onValueChange={(v) => toggleShareLocation(item.id, v)} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (<View style={{ alignItems: 'center', marginTop: 40 }}><Text style={{ color: colors.secondaryText }}>No friends yet</Text></View>)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  addBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  friendItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800' as const },
  name: { fontSize: 16, fontWeight: '700' as const },
  username: { fontSize: 12 },
});
