import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { PropertyCard } from '@/components/PropertyCard';
import { BottomNav } from '@/components/BottomNav';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png';

const tabs = ['Connect', 'Agent', 'Shortlet', 'Properties'] as const;
type Tab = typeof tabs[number];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, properties, closedProperties, setActiveTab } = useAppStore();
  
  const [currentTab, setCurrentTab] = useState<Tab>('Connect');
  const [refreshing, setRefreshing] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    if (tab === 'Connect' || tab === 'Agent') {
      setActiveTab(tab.toLowerCase() as 'connect' | 'agent');
    }
  };

  const filteredProperties = properties.filter((property) => {
    if (closedProperties.includes(property.id)) return false;
    
    const type = property.listingType || property.type;
    if (currentTab === 'Connect') return type === 'connect';
    if (currentTab === 'Agent') return type === 'agent';
    return false;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background gradient effects */}
      <View style={styles.gradientOverlay}>
        <View style={[styles.gradientCircle, styles.gradientLeft, { backgroundColor: `${colors.primary}10` }]} />
        <View style={[styles.gradientCircle, styles.gradientRight, { backgroundColor: `${colors.primary}05` }]} />
      </View>

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: `${colors.card}CC`,
            borderBottomColor: colors.border,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        {/* Top Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={[styles.profileButton, { borderColor: `${colors.primary}50` }]}
          >
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
              style={styles.profileImage}
              contentFit="cover"
            />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={{ uri: LOGO_URL }}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={[styles.logoText, { color: colors.foreground }]}>SpaceButton</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/wallet')}
              style={[styles.connectButton, { backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.connectText, { color: colors.primary }]}>
                {user?.connectsRemaining || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/saved')}
              style={styles.savedButton}
            >
              <LinearGradient
                colors={['#703BF7', '#5f32d4']}
                style={styles.savedButtonGradient}
              >
                <Icon name="bookmark" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={[styles.tabsWrapper, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabChange(tab)}
                style={styles.tabButton}
              >
                {currentTab === tab ? (
                  <LinearGradient
                    colors={['#703BF7', '#5f32d4']}
                    style={styles.activeTab}
                  >
                    <Text style={styles.activeTabText}>{tab}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveTab}>
                    <Text style={[styles.inactiveTabText, { color: colors.mutedForeground }]}>
                      {tab}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {currentTab === 'Shortlet' || currentTab === 'Properties' ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="clock" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Coming Soon</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              We're working on bringing you amazing {currentTab.toLowerCase()} options.
            </Text>
            <View style={styles.sparklesRow}>
              <Icon name="sparkles" size={16} color={colors.primary} />
              <Text style={[styles.sparklesText, { color: colors.primary }]}>
                Stay tuned for updates
              </Text>
            </View>
          </View>
        ) : filteredProperties.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="bookmark" size={48} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Listings Yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Be the first to post a listing in this category.
            </Text>
          </View>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
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
    top: 150,
    right: -150,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 36,
    height: 36,
  },
  logoText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  connectButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  connectText: {
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  savedButton: {
    width: 48,
    height: 48,
  },
  savedButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  tabsWrapper: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    padding: 4,
    borderWidth: 1,
  },
  tabButton: {
    paddingHorizontal: 2,
  },
  activeTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  activeTabText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  inactiveTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  inactiveTabText: {
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
    textAlign: 'center',
    maxWidth: 250,
  },
  sparklesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  sparklesText: {
    fontSize: FontSize.sm,
  },
});
