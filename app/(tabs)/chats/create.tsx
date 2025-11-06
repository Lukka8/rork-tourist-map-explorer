import { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocial, FriendProfile } from '@/lib/social-context';
import { Check, UserPlus, Users } from 'lucide-react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function CreateChatScreen() {
  const { friends, createChat } = useSocial();
  const colors = useThemeColors();
  const router = useRouter();

  const [mode, setMode] = useState<'dm' | 'group'>('dm');
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');

  const filtered = useMemo(() => {
    return friends.filter((f) => (
      f.username?.toLowerCase().includes(search.toLowerCase()) || f.name?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [friends, search]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      if (mode === 'dm') {
        return exists ? [] : [id];
      }
      return exists ? prev.filter((x) => x !== id) : [...prev, id];
    });
  }, [mode]);

  const canCreate = useMemo(() => {
    if (mode === 'dm') return selected.length === 1;
    return selected.length >= 2 && groupName.trim().length > 0;
  }, [mode, selected, groupName]);

  const submit = useCallback(() => {
    if (!canCreate) return;
    if (mode === 'dm') {
      const friend = friends.find((f) => f.id === selected[0]);
      const name = friend?.name ?? 'Chat';
      const id = createChat(name, selected);
      console.log('[CreateChat] Created DM', { id, selected });
      router.replace(`/chats/${id}`);
      return;
    }
    const id = createChat(groupName.trim(), selected);
    console.log('[CreateChat] Created group', { id, selected, groupName });
    router.replace(`/chats/${id}`);
  }, [canCreate, mode, selected, groupName, friends, createChat, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}
      testID="create-chat-screen"
    >
      <View style={styles.segmented}
        testID="create-chat-mode-toggle"
      >
        <TouchableOpacity
          style={[styles.segmentBtn, mode === 'dm' ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => setMode('dm')}
          accessibilityRole="button"
        >
          <Text style={[styles.segmentText, { color: mode === 'dm' ? '#FFF' : colors.text }]}>Direct</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, mode === 'group' ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => setMode('group')}
          accessibilityRole="button"
        >
          <Text style={[styles.segmentText, { color: mode === 'group' ? '#FFF' : colors.text }]}>Group</Text>
        </TouchableOpacity>
      </View>

      {mode === 'group' && (
        <TextInput
          testID="group-name-input"
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Group name"
          placeholderTextColor={colors.secondaryText}
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
        />
      )}

      <TextInput
        testID="user-search-input"
        value={search}
        onChangeText={setSearch}
        placeholder="Search friends"
        placeholderTextColor={colors.secondaryText}
        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
      />

      <FlatList
        testID="friends-list"
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <FriendRow
            key={item.id}
            item={item}
            selected={selected.includes(item.id)}
            onPress={() => toggle(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.secondaryText }]}>No friends found</Text></View>
        )}
      />

      <TouchableOpacity
        testID="create-chat-submit"
        onPress={submit}
        disabled={!canCreate}
        style={[styles.submit, { backgroundColor: colors.primary }, !canCreate && { opacity: 0.5 }]}
      >
        {mode === 'dm' ? <UserPlus size={18} color="#FFF" /> : <Users size={18} color="#FFF" />}
        <Text style={styles.submitText}>{mode === 'dm' ? 'Start chat' : 'Create group'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function FriendRow({ item, selected, onPress }: { item: FriendProfile; selected: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      testID={`friend-${item.id}`}
      style={[rowStyles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[rowStyles.avatar, { backgroundColor: colors.primary + '20' }]}>
        <Text style={{ color: colors.primary, fontWeight: '700' as const }}>{item.name?.charAt(0) ?? '?'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[rowStyles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[rowStyles.username, { color: colors.secondaryText }]}>@{item.username}</Text>
      </View>
      {selected && (
        <View style={[rowStyles.check, { backgroundColor: colors.primary }]}>
          <Check size={16} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  segmented: { flexDirection: 'row', gap: 8 },
  segmentBtn: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  segmentText: { fontWeight: '700' as const },
  input: { height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  submit: { position: 'absolute', left: 16, right: 16, bottom: 16, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  submitText: { color: '#FFF', fontWeight: '700' as const },
  empty: { alignItems: 'center', marginTop: 24 },
  emptyText: {},
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700' as const },
  username: { fontSize: 12 },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
