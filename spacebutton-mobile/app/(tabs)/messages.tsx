import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { BottomNav } from '@/components/BottomNav';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function MessagesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { conversations } = useAppStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
      </View>

      {/* Conversations List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="message-circle" size={48} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Messages</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Start a conversation by connecting with a property owner
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              onPress={() => router.push(`/chat/${conversation.id}`)}
              style={[
                styles.conversationItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: conversation.user.avatar }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                {conversation.user.online && (
                  <View style={[styles.onlineIndicator, { borderColor: colors.card }]} />
                )}
              </View>
              
              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.conversationName, { color: colors.foreground }]}>
                    {conversation.user.name}
                  </Text>
                  <Text style={[styles.conversationTime, { color: colors.mutedForeground }]}>
                    {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                  </Text>
                </View>
                <View style={styles.conversationFooter}>
                  <Text
                    style={[
                      styles.lastMessage,
                      { color: conversation.unread > 0 ? colors.foreground : colors.mutedForeground },
                    ]}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
                  </Text>
                  {conversation.unread > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.unreadCount}>{conversation.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    maxWidth: 250,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  conversationName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  conversationTime: {
    fontSize: FontSize.xs,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: FontSize.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
