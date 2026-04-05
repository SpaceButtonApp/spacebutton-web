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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../lib/store';
import { mockAgents, mockConversations } from '../../lib/mock-data';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id, propertyId } = useLocalSearchParams<{ id: string; propertyId?: string }>();
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const { properties, conversations, addConversation, user } = useAppStore();

  // Find property and agent
  const property = propertyId 
    ? properties.find((p) => p.id === propertyId) 
    : properties.find((p) => p.agent?.id === id);
  
  // Use the property agent if available, otherwise fallback
  const agent = property?.agent || 
    conversations.find(c => c.user?.id === id)?.user ||
    mockConversations.find(c => c.user?.id === id)?.user ||
    mockAgents.find((a) => a.id === id) || 
    mockAgents[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // Add conversation when chat is opened
  useEffect(() => {
    if (agent && propertyId) {
      const existingConversation = conversations.find(c => c.user?.id === agent.id);
      if (!existingConversation) {
        addConversation({
          id: `conv-${agent.id}-${Date.now()}`,
          user: agent,
          lastMessage: 'Started conversation',
          timestamp: new Date(),
          unread: 0
        });
      }
    }
  }, [agent, propertyId, conversations, addConversation]);

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

  const handleVideoCall = () => {
    router.push(`/call/video/${id}` as any);
  };

  const handleVoiceCall = () => {
    router.push(`/call/voice/${id}` as any);
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
            {agent?.avatar ? (
              <Image source={{ uri: agent.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {agent?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
            {agent?.online && (
              <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
            )}
          </View>
          <View>
            <Text style={[styles.headerName, { color: colors.text }]}>
              {agent?.name || 'User'}
            </Text>
            <Text style={[styles.headerStatus, { color: agent?.online ? colors.success : colors.textSecondary }]}>
              {agent?.online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleVideoCall}
            style={[styles.actionButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="videocam" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleVoiceCall}
            style={[styles.actionButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="call" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowMenu(!showMenu)}
            style={[styles.actionButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Property Banner */}
      {property && property.images && property.images[0] && (
        <TouchableOpacity 
          onPress={() => router.push(`/property/${property.id}` as any)}
          style={[styles.propertyBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Image 
            source={{ uri: property.images[0] }} 
            style={styles.propertyImage}
          />
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyTitle, { color: colors.text }]} numberOfLines={1}>
              {property.title}
            </Text>
            <Text style={[styles.propertyLocation, { color: colors.textSecondary }]} numberOfLines={1}>
              {property.location}
            </Text>
            <Text style={[styles.propertyPrice, { color: colors.primary }]}>
              ₦{property.price.toLocaleString()}{property.rentPeriod ? `/${property.rentPeriod === 'monthly' ? 'month' : 'year'}` : ''}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Done Deal</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="chatbubble" size={20} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Start a conversation
              </Text>
            </View>
          }
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
            placeholder="Message here..."
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: colors.foreground }]}
            onPress={sendMessage}
          >
            <Ionicons name="send" size={18} color={colors.background} />
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
    marginLeft: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyBanner: {
    flexDirection: 'row',
    margin: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  propertyLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingRight: 16,
    alignItems: 'flex-end',
  },
  menuContainer: {
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
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
