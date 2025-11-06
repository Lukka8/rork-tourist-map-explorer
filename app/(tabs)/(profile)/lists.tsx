import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useLists } from '@/lib/lists-context';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function ListsScreen() {
  const { lists, isLoading, createList, renameList, removeList } = useLists();
  const [name, setName] = useState<string>('');
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <Stack.Screen options={{ title: 'My Lists' }} />
      <View style={styles.row}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New list name"
          placeholderTextColor={colors.secondaryText}
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
        />
        <TouchableOpacity
          accessibilityRole="button"
          testID="create-list"
          style={[styles.create, { backgroundColor: colors.primary }]}
          onPress={async () => { if (!name.trim()) return; await createList(name.trim()); setName(''); }}
        >
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
              <Text style={{ color: colors.secondaryText, fontSize: 12 }}>{item.items.length} items</Text>
            </View>
            <TouchableOpacity style={[styles.small, { borderColor: colors.border }]} onPress={() => {
              Alert.prompt?.('Rename list', 'Enter a new name', [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', onPress: async (v?: string) => { if (v) await renameList(item.id, v); } }], 'plain-text', item.name);
            }}>
              <Text style={{ color: colors.text }}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.small, { borderColor: colors.error }]} onPress={() => removeList(item.id)}>
              <Text style={{ color: colors.error }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={{ color: colors.secondaryText }}>No lists yet</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  create: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  createText: { color: '#FFF', fontWeight: '700' as const },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 12, borderWidth: 1 },
  small: { height: 36, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700' as const },
  empty: { alignItems: 'center', marginTop: 40 },
});
