import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type UserId = string;

export interface FriendProfile {
  id: UserId;
  username: string;
  name: string;
  avatarUrl?: string;
  lastSeen?: string;
  locationSharing?: boolean;
}

export interface FriendRequest {
  id: string;
  from: FriendProfile;
  to: UserId;
  createdAt: string;
}

export interface Circle {
  id: string;
  name: string;
  members: UserId[];
  createdAt: string;
}

export interface MessagePartText { type: 'text'; text: string }
export interface MessagePartImage { type: 'image'; uri: string }
export type MessagePart = MessagePartText | MessagePartImage;

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: UserId;
  createdAt: string;
  parts: MessagePart[];
}

export interface Chat {
  id: string;
  name: string;
  members: UserId[];
  lastMessageAt?: string;
}

interface SocialState {
  friends: FriendProfile[];
  requests: FriendRequest[];
  circles: Circle[];
  chats: Chat[];
  messagesByChat: Record<string, ChatMessage[]>;
  isLoading: boolean;
  addFriend: (profile: FriendProfile) => void;
  sendFriendRequest: (username: string) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  createCircle: (name: string, memberIds: UserId[]) => void;
  toggleShareLocation: (friendId: string, value: boolean) => void;
  createChat: (name: string, memberIds: UserId[]) => string;
  addMembersToChat: (chatId: string, memberIds: UserId[]) => void;
  sendMessage: (chatId: string, message: Omit<ChatMessage, 'id'|'createdAt'>) => void;
}

const STORAGE_KEY = '@social_state_v1';

function useSocialImpl(): SocialState {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw) as Omit<SocialState, 'isLoading' | 'addFriend' | 'sendFriendRequest' | 'acceptRequest' | 'declineRequest' | 'createCircle' | 'toggleShareLocation' | 'createChat' | 'sendMessage'>;
          setFriends(data.friends || []);
          setRequests(data.requests || []);
          setCircles(data.circles || []);
          setChats(data.chats || []);
          setMessagesByChat(data.messagesByChat || {});
        }
      } catch (e) {
        console.log('[Social] Failed to load state', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (next: Partial<SocialState>) => {
    const snapshot = {
      friends,
      requests,
      circles,
      chats,
      messagesByChat,
      ...next,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [friends, requests, circles, chats, messagesByChat]);

  const addFriend = useCallback((profile: FriendProfile) => {
    const exists = friends.some(f => f.id === profile.id);
    if (exists) return;
    const next = [...friends, profile];
    setFriends(next);
    persist({ friends: next });
  }, [friends, persist]);

  const sendFriendRequest = useCallback((username: string) => {
    const req: FriendRequest = {
      id: `req_${Date.now()}`,
      from: {
        id: 'me',
        username: 'me',
        name: 'Me',
      },
      to: username,
      createdAt: new Date().toISOString(),
    } as any;
    const next = [req, ...requests];
    setRequests(next);
    persist({ requests: next });
  }, [requests, persist]);

  const acceptRequest = useCallback((requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const remaining = requests.filter(r => r.id !== requestId);
    setRequests(remaining);
    const newFriend: FriendProfile = req.from;
    const nextFriends = [...friends, newFriend];
    setFriends(nextFriends);
    persist({ requests: remaining, friends: nextFriends });
  }, [requests, friends, persist]);

  const declineRequest = useCallback((requestId: string) => {
    const remaining = requests.filter(r => r.id !== requestId);
    setRequests(remaining);
    persist({ requests: remaining });
  }, [requests, persist]);

  const createCircle = useCallback((name: string, memberIds: UserId[]) => {
    const circle: Circle = { id: `circle_${Date.now()}`, name, members: memberIds, createdAt: new Date().toISOString() };
    const next = [circle, ...circles];
    setCircles(next);
    persist({ circles: next });
  }, [circles, persist]);

  const toggleShareLocation = useCallback((friendId: string, value: boolean) => {
    const next = friends.map(f => f.id === friendId ? { ...f, locationSharing: value } : f);
    setFriends(next);
    persist({ friends: next });
  }, [friends, persist]);

  const createChat = useCallback((name: string, memberIds: UserId[]) => {
    const id = `chat_${Date.now()}`;
    const chat: Chat = { id, name, members: Array.from(new Set(['me', ...memberIds])), lastMessageAt: new Date().toISOString() };
    const next = [chat, ...chats];
    setChats(next);
    persist({ chats: next });
    return id;
  }, [chats, persist]);

  const addMembersToChat = useCallback((chatId: string, memberIds: UserId[]) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    const updated: Chat = { ...chat, members: Array.from(new Set([...(chat.members || []), ...memberIds])) };
    const next = chats.map(c => c.id === chatId ? updated : c);
    setChats(next);
    persist({ chats: next });
  }, [chats, persist]);

  const sendMessage = useCallback((chatId: string, input: Omit<ChatMessage, 'id'|'createdAt'>) => {
    const msg: ChatMessage = {
      ...input,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const list = messagesByChat[chatId] ?? [];
    const nextList = [...list, msg];
    const nextMap = { ...messagesByChat, [chatId]: nextList };
    setMessagesByChat(nextMap);
    const nextChats = chats.map(c => c.id === chatId ? { ...c, lastMessageAt: msg.createdAt } : c);
    setChats(nextChats);
    persist({ messagesByChat: nextMap, chats: nextChats });
  }, [messagesByChat, chats, persist]);

  return {
    friends,
    requests,
    circles,
    chats,
    messagesByChat,
    isLoading,
    addFriend,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    createCircle,
    toggleShareLocation,
    createChat,
    addMembersToChat,
    sendMessage,
  };
}

export const [SocialProvider, useSocial] = createContextHook(useSocialImpl);
