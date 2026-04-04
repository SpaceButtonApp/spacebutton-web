import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { BottomNav } from '@/components/BottomNav';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        <BackButton fallbackUrl="/(tabs)/settings" />
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllNotificationsRead}>
            <Text style={[styles.markAllRead, { color: colors.primary }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="bell" size={48} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Notifications</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              You're all caught up!
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => markNotificationRead(notification.id)}
              style={[
                styles.notificationItem,
                { backgroundColor: notification.read ? colors.background : colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: notification.read ? colors.secondary : `${colors.primary}20` },
                ]}
              >
                <Icon
                  name="bell"
                  size={20}
                  color={notification.read ? colors.mutedForeground : colors.primary}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: colors.foreground }]}>
                  {notification.title}
                </Text>
                <Text style={[styles.notificationMessage, { color: colors.mutedForeground }]}>
                  {notification.message}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.mutedForeground }]}>
                  {notification.timestamp 
                    ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
                    : 'Recently'}
                </Text>
              </View>
              {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    flex: 1,
    textAlign: 'center',
  },
  markAllRead: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
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
  },
  notificationItem: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  notificationMessage: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: FontSize.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
});
