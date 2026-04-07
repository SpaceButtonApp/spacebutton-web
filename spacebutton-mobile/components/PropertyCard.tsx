import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { Icon } from '@/components/Icons';
import { formatPrice, type Property } from '@/lib/mock-data';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface PropertyCardProps {
  property: Property;
  variant?: 'full' | 'compact';
}

export function PropertyCard({ property, variant = 'full' }: PropertyCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { savedProperties, toggleSaveProperty } = useAppStore();
  const isSaved = savedProperties.includes(property.id);
  
  // Check if this is a Properties listing type
  const isPropertyType = property.type === 'properties' || property.listingType === 'properties';

  const handlePress = () => {
    router.push(`/property/${property.id}`);
  };

  const handleSave = () => {
    toggleSaveProperty(property.id);
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: property.images[0] }}
          style={styles.compactImage}
          contentFit="cover"
        />
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={1}>
              {property.title}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Icon
                name="bookmark"
                size={20}
                color={isSaved ? colors.primary : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.locationRow}>
            <Icon name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={[styles.locationText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {property.location}
            </Text>
          </View>
          <View style={styles.tagsRow}>
            {isPropertyType ? (
              <>
                <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                  <Icon name="building" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                    {property.propertyCategory || property.category}
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                  <Icon name="dollar-sign" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                    {property.propertyType || 'Sale'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                  <Icon name="users" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                    {property.type === 'connect' 
                      ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Tenant') 
                      : 'Agent'}
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                  <Icon name="building" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                    {property.category}
                  </Text>
                </View>
              </>
            )}
          </View>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(property.price, property.rentPeriod)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images[0] }}
          style={styles.image}
          contentFit="cover"
        />
        {property.isAdminPost && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
            <Icon name="check-circle" size={20} color="#fff" />
          </View>
        )}
        <View style={styles.imageBadges}>
          <View style={styles.photoBadge}>
            <Icon name="camera" size={14} color="#fff" />
            <Text style={styles.photoCount}>{property.photoCount}</Text>
          </View>
          <View style={styles.gridBadge}>
            <Icon name="grid" size={16} color="#fff" />
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {property.title}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Icon
              name="bookmark"
              size={24}
              color={isSaved ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.locationRow}>
          <Icon name="map-pin" size={14} color={colors.primary} />
          <Text style={[styles.location, { color: colors.mutedForeground }]}>{property.location}</Text>
        </View>
        {isPropertyType ? (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="building" size={14} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {property.propertyCategory || property.category}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="dollar-sign" size={14} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {property.propertyType || 'Sale'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="grid" size={14} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {property.locationCategory || 'Estate'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="users" size={14} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {property.type === 'connect' 
                  ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Tenant') 
                  : 'Agent'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="users" size={14} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {property.condition}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="building" size={14} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {property.category}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.footer}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {formatPrice(property.price, property.rentPeriod)}
          </Text>
          <TouchableOpacity
            onPress={handlePress}
            style={[styles.detailsButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.detailsButtonText}>Full Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius['3xl'],
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadges: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  photoCount: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  gridBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  location: {
    fontSize: FontSize.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: FontSize.sm,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  detailsButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: FontWeight.medium,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  compactImage: {
    width: 110,
    height: 100,
    borderRadius: BorderRadius.xl,
  },
  compactContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  compactTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  locationText: {
    fontSize: FontSize.xs,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  tagText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  price: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.sm,
  },
});
