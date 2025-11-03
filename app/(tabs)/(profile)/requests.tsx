import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSocial } from '@/lib/social-context';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function RequestsScreen() {
  const { requests, acceptRequest, declineRequest } = useSocial();
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={[styles.reqItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{item.from.name[0] ?? 'U'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{item.from.name}</Text>
              <Text style={[styles.username, { color: colors.secondaryText }]}>@{item.from.username}</Text>
            </View>
            <TouchableOpacity style={[styles.btn, styles.accept, { backgroundColor: colors.success }]} onPress={() => acceptRequest(item.id)}>
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.decline, { backgroundColor: colors.error }]} onPress={() => declineRequest(item.id)}>
              <Text style={styles.btnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (<View style={{ alignItems: 'center', marginTop: 40 }}><Text style={{ color: colors.secondaryText }}>No requests</Text></View>)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  reqItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800' as const },
  name: { fontSize: 16, fontWeight: '700' as const },
  username: { fontSize: 12 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  accept: {},
  decline: {},
  btnText: { color: '#FFF', fontWeight: '700' as const },
});
