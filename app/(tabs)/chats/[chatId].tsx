import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image as RNImage } from 'react-native';
import { useSocial } from '@/lib/social-context';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { ImagePlus, Send } from 'lucide-react-native';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { chats, messagesByChat, sendMessage } = useSocial();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F5F7FA' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={[styles.msg, item.senderId === 'me' ? styles.me : styles.them]}>
              {item.parts.map((p, idx) => p.type === 'text' ? (
                <Text key={idx} style={styles.msgText}>{p.text}</Text>
              ) : (
                <ExpoImage key={idx} source={{ uri: p.uri }} style={styles.msgImage} contentFit="cover" />
              ))}
              <Text style={styles.msgTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 12 }}
        />
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={pickImage} style={styles.mediaBtn}>
            <ImagePlus size={20} color="#007AFF" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity onPress={onSend} disabled={sending || !text.trim()} style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.5 }]}>
            <Send size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  msg: { maxWidth: '80%', marginBottom: 8, padding: 10, borderRadius: 14 },
  me: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  them: { alignSelf: 'flex-start', backgroundColor: '#E5E7EB' },
  msgText: { color: '#FFF' },
  msgImage: { width: 220, height: 180, borderRadius: 12 },
  msgTime: { fontSize: 10, color: '#FFF', marginTop: 4, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  mediaBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF6FF' },
  input: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', paddingHorizontal: 12 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF' },
});
