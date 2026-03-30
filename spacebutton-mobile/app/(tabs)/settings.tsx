import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { BottomNav } from '@/components/BottomNav';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const menuItems = [
  { icon: 'user', label: 'Profile', href: '/profile', bg: '#703BF720' },
  { icon: 'wallet', label: 'My Wallet', href: '/wallet', bg: '#3b82f620' },
  { icon: 'crown', label: 'Premium', href: '/premium', bg: '#eab30820' },
  { icon: 'bell', label: 'Notifications', href: '/notifications', badge: 5, bg: '#22c55e20' },
  { icon: 'help-circle', label: 'Help & Support', href: '/help', bg: '#06b6d420' },
  { icon: 'log-out', label: 'Log Out', href: '/logout', bg: '#ef444420', isDestructive: true },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAppStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleItemPress = (item: typeof menuItems[0]) => {
    if (item.label === 'Log Out') {
      setShowLogoutModal(true);
    } else {
      router.push(item.href as any);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogoutModal(false);
    router.replace('/welcome');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background gradient effects */}
      <View style={styles.gradientOverlay}>
        <View style={[styles.gradientCircle, styles.gradientLeft, { backgroundColor: `${colors.primary}10` }]} />
        <View style={[styles.gradientCircle, styles.gradientRight, { backgroundColor: '#3b82f610' }]} />
      </View>

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.sm },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <TouchableOpacity onPress={toggleTheme} style={[styles.themeButton, { backgroundColor: colors.secondary }]}>
          <Icon name={isDark ? 'sun' : 'moon'} size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={[styles.avatarContainer, { borderColor: `${colors.primary}50` }]}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
        <Text style={[styles.userName, { color: colors.foreground }]}>
          {user?.name || 'Guest'}
        </Text>
        <Text style={[styles.userType, { color: colors.mutedForeground }]}>
          {user?.type || 'Individual'}
        </Text>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => handleItemPress(item)}
            style={[
              styles.menuItem,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={item.isDestructive ? colors.destructive : colors.foreground}
                />
              </View>
              <Text
                style={[
                  styles.menuItemLabel,
                  { color: item.isDestructive ? colors.destructive : colors.foreground },
                ]}
              >
                {item.label}
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              {item.badge && (
                <View style={[styles.badge, { backgroundColor: colors.success }]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav />

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: `${colors.destructive}20` }]}>
              <Icon name="log-out" size={32} color={colors.destructive} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Log Out?
            </Text>
            <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>
              Are you sure you want to log out of your account?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowLogoutModal(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Log Out"
                onPress={handleLogout}
                variant="destructive"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  gradientCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  gradientLeft: {
    top: 0,
    left: -150,
  },
  gradientRight: {
    bottom: 0,
    right: -150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  userType: {
    fontSize: FontSize.base,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
});
