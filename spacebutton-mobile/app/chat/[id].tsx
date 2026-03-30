import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { conversations } from '../../lib/mock-data';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const conversation = conversations.find(c => c.id === id);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: conversation?.lastMessage || 'Hello!',
      sender: 'other',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      text: 'Hi! I am interested in the property.',
      sender: 'me',
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: '3',
      text: 'Great! Would you like to schedule a viewing?',
      sender: 'other',
      timestamp: new Date(Date.now() - 2400000),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'me',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! I will get back to you soon.',
        sender: 'other',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.otherMessage,
      ]}>
        <View style={[
          styles.messageBubble,
          isMe 
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.card }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isMe ? '#FFFFFF' : colors.text }
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            {conversation?.avatar ? (
              <Image source={{ uri: conversation.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {conversation?.name.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <View>
            <Text style={[styles.headerName, { color: colors.text }]}>
              {conversation?.name || 'User'}
            </Text>
            <Text style={[styles.headerStatus, { color: colors.success }]}>
              Online
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={[styles.inputContainer, { 
          backgroundColor: colors.background,
          borderTopColor: colors.border 
        }]}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              color: colors.text 
            }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={sendMessage}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageContainer: {
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  attachButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
