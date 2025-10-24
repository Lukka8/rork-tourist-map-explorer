import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useSocial } from '@/lib/social-context';

export default function CirclesScreen() {
  const { circles, friends, createCircle, toggleShareLocation } = useSocial();
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="New circle name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => { if (name.trim()) { createCircle(name.trim(), friends.map(f => f.id)); setName(''); } }}>
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={circles}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <View style={styles.circleItem}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.members.length} members</Text>
          </View>
        )}
        ListEmptyComponent={() => (<View style={{ alignItems: 'center', marginTop: 40 }}><Text style={{ color: '#999' }}>No circles</Text></View>)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 12, backgroundColor: '#FFF' },
  addBtn: { width: 64, height: 44, borderRadius: 12, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  circleItem: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EEE' },
  name: { fontSize: 16, fontWeight: '700' as const, color: '#1a1a1a' },
  meta: { fontSize: 12, color: '#666' },
});
