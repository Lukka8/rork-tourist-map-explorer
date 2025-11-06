import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '@/lib/use-theme-colors';
import { NYC_ATTRACTIONS, TBILISI_ATTRACTIONS } from '@/constants/attractions';
import { api } from '@/lib/api-client';

interface FeedItem {
  id: string;
  user: { id: string; name: string; avatarUrl?: string };
  attractionId: string;
  photoUri?: string;
  createdAt: string;
}

export default function ActivityScreen() {
  const colors = useThemeColors();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const all = useMemo(() => [...NYC_ATTRACTIONS, ...TBILISI_ATTRACTIONS], []);

  const getAttraction = (id: string) => all.find(a => a.id === id);

  useEffect(() => {
    let mounted = true;
    api.feed.get()
      .then((data) => { if (mounted) { setItems(data); } })
      .catch((e) => { if (mounted) { setError(e instanceof Error ? e.message : 'Failed to load'); } })
      .finally(() => { if (mounted) { setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.secondaryBackground }]}><Text style={{ color: colors.secondaryText }}>Loading...</Text></View>;
  }

  if (error) {
    return <View style={[styles.center, { backgroundColor: colors.secondaryBackground }]}><Text style={{ color: colors.error }}>{error}</Text></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const a = getAttraction(item.attractionId);
          if (!a) return null;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.row}>
                <RNImage source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.user.name}</Text>
                  <Text style={[styles.meta, { color: colors.secondaryText }]}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.attractionRow}>
                <Image source={{ uri: a.imageUrl }} style={styles.thumbnail} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.attractionName, { color: colors.text }]}>{a.name}</Text>
                  <Text style={[styles.attractionDesc, { color: colors.secondaryText }]} numberOfLines={2}>{a.description}</Text>
                </View>
              </View>
              {item.photoUri && (
                <Image source={{ uri: item.photoUri }} style={styles.userPhoto} contentFit="cover" />
              )}
            </View>
          );
        }}
        ListEmptyComponent={<View style={styles.center}><Text style={{ color: colors.secondaryText }}>No activity yet</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DDD' },
  name: { fontSize: 16, fontWeight: '700' as const },
  meta: { fontSize: 12 },
  attractionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumbnail: { width: 80, height: 80, borderRadius: 12 },
  attractionName: { fontSize: 15, fontWeight: '700' as const, marginBottom: 4 },
  attractionDesc: { fontSize: 12 },
  userPhoto: { width: '100%', height: 220, borderRadius: 12 },
});
