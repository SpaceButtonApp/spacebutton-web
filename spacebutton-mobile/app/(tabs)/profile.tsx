import React, { useState } from 'react';
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
import { PropertyCard } from '@/components/PropertyCard';
import { BottomNav } from '@/components/BottomNav';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const tabs = ['Reviews', 'Listings', 'Closed'] as const;
type Tab = typeof tabs[number];

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, properties, closedProperties, reviews } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('Listings');

  const userProperties = properties.filter((p) => 
    p.ownerId === user?.id && !closedProperties.includes(p.id)
  );
  const userClosedProperties = properties.filter((p) => 
    p.ownerId === user?.id && closedProperties.includes(p.id)
  );
  const userReviews = reviews.filter((r) => r.toUserId === user?.id);
  const averageRating = userReviews.length > 0 
    ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
    : '0.0';

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
        <BackButton fallbackUrl="/home" />
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity
          onPress={() => router.push('/profile/edit' as any)}
          style={[styles.editButton, { backgroundColor: colors.secondary }]}
        >
          <Icon name="edit" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { borderColor: colors.secondary }]}>
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

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {userProperties.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Listings
              </Text>
            </View>
            <View style={[styles.statCard, { borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {userClosedProperties.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Closed
              </Text>
            </View>
            <View style={[styles.statCard, { borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {averageRating}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Rating
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={[styles.tabsWrapper, { backgroundColor: colors.secondary }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabButton,
                  activeTab === tab && { backgroundColor: colors.background },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? colors.foreground : colors.mutedForeground },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'Reviews' && (
          <View style={styles.tabContent}>
            {userReviews.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No reviews yet.
              </Text>
            ) : (
              userReviews.map((review) => (
                <View
                  key={review.id}
                  style={[styles.reviewCard, { backgroundColor: colors.secondary }]}
                >
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{ uri: review.fromUserAvatar }}
                      style={styles.reviewAvatar}
                      contentFit="cover"
                    />
                    <View style={styles.reviewInfo}>
                      <Text style={[styles.reviewName, { color: colors.foreground }]}>
                        {review.fromUserName}
                      </Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            name="star"
                            size={14}
                            color={star <= review.rating ? '#eab308' : colors.mutedForeground}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={[styles.reviewTime, { color: colors.mutedForeground }]}>
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </Text>
                  </View>
                  <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>
                    {review.feedback}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'Listings' && (
          <View style={styles.tabContent}>
            {userProperties.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                You haven't posted any listings yet.
              </Text>
            ) : (
              userProperties.map((property) => (
                <PropertyCard key={property.id} property={property} variant="compact" />
              ))
            )}
          </View>
        )}

        {activeTab === 'Closed' && (
          <View style={styles.tabContent}>
            {userClosedProperties.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No closed listings yet.
              </Text>
            ) : (
              userClosedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} variant="compact" />
              ))
            )}
          </View>
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
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
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
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  statLabel: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  tabsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  tabsWrapper: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  tabButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  tabContent: {
    marginTop: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: Spacing['3xl'],
    fontSize: FontSize.base,
  },
  reviewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTime: {
    fontSize: FontSize.xs,
  },
  reviewText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
