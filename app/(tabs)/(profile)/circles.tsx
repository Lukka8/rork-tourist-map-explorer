import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useSocial } from '@/lib/social-context';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function CirclesScreen() {
  const { circles, friends, createCircle, toggleShareLocation } = useSocial();
  const [name, setName] = useState('');
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="New circle name"
          placeholderTextColor={colors.secondaryText}
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => { if (name.trim()) { createCircle(name.trim(), friends.map(f => f.id)); setName(''); } }}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={circles}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <View style={[styles.circleItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: colors.secondaryText }]}>{item.members.length} members</Text>
          </View>
        )}
        ListEmptyComponent={() => (<View style={{ alignItems: 'center', marginTop: 40 }}><Text style={{ color: colors.secondaryText }}>No circles</Text></View>)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  addBtn: { width: 64, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  circleItem: { borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  name: { fontSize: 16, fontWeight: '700' as const },
  meta: { fontSize: 12 },
});
