import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image as RNImage } from 'react-native';
import { useSocial } from '@/lib/social-context';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { ImagePlus, Send } from 'lucide-react-native';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { chats, messagesByChat, sendMessage } = useSocial();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const colors = useThemeColors();

  const chat = useMemo(() => chats.find(c => c.id === chatId), [chats, chatId]);
  const messages = messagesByChat[chatId ?? ''] ?? [];

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
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity onPress={pickImage} style={[styles.mediaBtn, { backgroundColor: colors.primary + '20' }]}>
            <ImagePlus size={20} color={colors.primary} />
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
