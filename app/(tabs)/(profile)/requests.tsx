import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSocial } from '@/lib/social-context';

export default function RequestsScreen() {
  const { requests, acceptRequest, declineRequest } = useSocial();

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={styles.reqItem}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.from.name[0] ?? 'U'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.from.name}</Text>
              <Text style={styles.username}>@{item.from.username}</Text>
            </View>
            <TouchableOpacity style={[styles.btn, styles.accept]} onPress={() => acceptRequest(item.id)}>
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.decline]} onPress={() => declineRequest(item.id)}>
              <Text style={styles.btnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (<View style={{ alignItems: 'center', marginTop: 40 }}><Text style={{ color: '#999' }}>No requests</Text></View>)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  reqItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EEE' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F4FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#007AFF', fontWeight: '800' as const },
  name: { fontSize: 16, fontWeight: '700' as const, color: '#1a1a1a' },
  username: { fontSize: 12, color: '#666' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  accept: { backgroundColor: '#34C759' },
  decline: { backgroundColor: '#FF3B30' },
  btnText: { color: '#FFF', fontWeight: '700' as const },
});
