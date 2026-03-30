import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const navItems = [
  { icon: 'home', href: '/home', label: 'Home' },
  { icon: 'search', href: '/search', label: 'Search' },
  { icon: 'message-circle', href: '/messages', label: 'Messages' },
  { icon: 'settings', href: '/settings', label: 'Settings' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { conversations } = useAppStore();
  const insets = useSafeAreaInsets();
  
  const unreadMessages = conversations.filter(c => c.unread > 0).length;

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
        },
      ]}
    >
      <View style={styles.nav}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const hasUnread = item.label === 'Messages' && unreadMessages > 0;

          return (
            <TouchableOpacity
              key={item.href}
              onPress={() => router.push(item.href as any)}
              style={[
                styles.navItem,
                active && { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                {hasUnread && <View style={styles.badge} />}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: active ? colors.primary : colors.mutedForeground },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => router.push('/add-post' as any)}
          style={styles.navItem}
        >
          <LinearGradient
            colors={['#703BF7', '#5f32d4']}
            style={styles.addButton}
          >
            <Icon name="plus" size={20} color="#fff" />
          </LinearGradient>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    minWidth: 60,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  label: {
    fontSize: FontSize.xs,
    marginTop: 4,
    fontWeight: FontWeight.medium,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#703BF7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
