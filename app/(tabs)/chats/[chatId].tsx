import { Stack, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';

import { useSocial, FriendProfile } from '@/lib/social-context';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { ImagePlus, Send, UserPlus } from 'lucide-react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { chats, messagesByChat, sendMessage, friends, addMembersToChat } = useSocial();
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const colors = useThemeColors();

  const chat = useMemo(() => chats.find(c => c.id === chatId), [chats, chatId]);
  const availableFriends = useMemo(() => friends.filter(f => !chat?.members.includes(f.id)), [friends, chat]);
  const messages = messagesByChat[chatId ?? ''] ?? [];

  useLayoutEffect(() => {
    if (!chat) return;
    (navigation as any)?.setOptions?.({
      headerRight: () => (
        <TouchableOpacity onPress={() => { setSelected([]); setShowAddMembers(true); }} style={{ paddingHorizontal: 12 }}>
          <UserPlus size={20} color={colors.primary} />
        </TouchableOpacity>
      ),
      title: chat.name,
    });
  }, [chat, navigation, colors.primary]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      const uri = res.assets[0].uri;
      sendMessage(chatId as string, { chatId: chatId as string, senderId: 'me', parts: [{ type: 'image', uri }] });
    }
  };

  const onSend = () => {
    if (!text.trim()) return;
    setSending(true);
    sendMessage(chatId as string, { chatId: chatId as string, senderId: 'me', parts: [{ type: 'text', text: text.trim() }] });
    setText('');
    setSending(false);
  };

  const onConfirmAddMembers = () => {
    if (!chatId || selected.length === 0) { setShowAddMembers(false); return; }
    addMembersToChat(chatId as string, selected);
    setShowAddMembers(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.secondaryBackground }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={[styles.msg, item.senderId === 'me' ? { ...styles.me, backgroundColor: colors.primary } : { ...styles.them, backgroundColor: colors.card }]}>
              {item.parts.map((p, idx) => p.type === 'text' ? (
                <Text key={idx} style={[styles.msgText, item.senderId === 'me' ? { color: '#FFF' } : { color: colors.text }]}>{p.text}</Text>
              ) : (
                <ExpoImage key={idx} source={{ uri: p.uri }} style={styles.msgImage} contentFit="cover" />
              ))}
              <Text style={[styles.msgTime, item.senderId === 'me' ? { color: '#FFF' } : { color: colors.secondaryText }]}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 12 }}
        />
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]} testID="chat-input-row">
          <TouchableOpacity onPress={pickImage} style={[styles.mediaBtn, { backgroundColor: colors.primary + '20' }]}>
            <ImagePlus size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => {
            const link = `https://example.com/invite/chat/${chatId}`;
            try {
              if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).clipboard?.writeText) {
                await (navigator as any).clipboard.writeText(link);
                console.log('[Chat] Invite link copied (web)');
              } else {
                console.log('[Chat] Invite link', link);
              }
              // lightweight feedback
            } catch (e) {
              console.log('[Chat] Failed to copy link', e);
            }
          }} style={[styles.mediaBtn, { backgroundColor: colors.primary + '20' }]} testID="invite-link-btn">
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Link</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground }]}
            placeholder="Message"
            placeholderTextColor={colors.secondaryText}
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity onPress={onSend} disabled={sending || !text.trim()} style={[styles.sendBtn, { backgroundColor: colors.primary }, (!text.trim() || sending) && { opacity: 0.5 }]}>
            <Send size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
      {showAddMembers && (
        <Modal transparent animationType="fade" visible={showAddMembers} onRequestClose={() => setShowAddMembers(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <View style={[{ padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: 420 }, { backgroundColor: colors.card }]}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 }}>Add members</Text>
              <FlatList
                data={availableFriends}
                keyExtractor={(it) => it.id}
                style={{ maxHeight: 280 }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setSelected((prev) => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])} style={[{ paddingVertical: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, { borderBottomColor: colors.border }]}>
                    <Text style={{ color: colors.text }}>{item.name}</Text>
                    <Text style={{ color: colors.secondaryText }}>{selected.includes(item.id) ? 'Selected' : 'Tap'}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<View style={{ paddingVertical: 24 }}><Text style={{ color: colors.secondaryText }}>No friends to add</Text></View>}
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={[{ flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: colors.searchBackground }]} onPress={() => setShowAddMembers(false)}>
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[{ flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: colors.primary, opacity: selected.length === 0 ? 0.5 : 1 }]} disabled={selected.length === 0} onPress={onConfirmAddMembers}>
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  msg: { maxWidth: '80%', marginBottom: 8, padding: 10, borderRadius: 14 },
  me: { alignSelf: 'flex-end' },
  them: { alignSelf: 'flex-start' },
  msgText: {},
  msgImage: { width: 220, height: 180, borderRadius: 12 },
  msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1 },
  mediaBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
