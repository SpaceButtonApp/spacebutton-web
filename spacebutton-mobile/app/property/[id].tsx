import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/Icons';
import { formatPrice, safetyTips } from '@/lib/mock-data';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { properties, savedProperties, toggleSaveProperty, user } = useAppStore();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const property = properties.find((p) => p.id === id);
  const isSaved = savedProperties.includes(id || '');

  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <BackButton fallbackUrl="/(tabs)/home" />
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.foreground }]}>
            Property not found
          </Text>
        </View>
      </View>
    );
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + Spacing.sm }]}>
        <BackButton
          fallbackUrl="/(tabs)/home"
          style={{ backgroundColor: `${colors.background}CC` }}
        />
        <TouchableOpacity
          onPress={() => toggleSaveProperty(property.id)}
          style={[styles.saveButton, { backgroundColor: `${colors.background}CC` }]}
        >
          <Icon
            name="bookmark"
            size={20}
            color={isSaved ? colors.primary : colors.foreground}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <TouchableOpacity
          onPress={() => setShowFullScreen(true)}
          style={styles.imageContainer}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: property.images[currentImageIndex] }}
            style={styles.mainImage}
            contentFit="cover"
          />
          
          {/* Navigation Arrows */}
          {property.images.length > 1 && (
            <>
              <TouchableOpacity
                onPress={handlePrevImage}
                style={[styles.navButton, styles.navButtonLeft]}
              >
                <Icon name="chevron-left" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextImage}
                style={[styles.navButton, styles.navButtonRight]}
              >
                <Icon name="chevron-right" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* Image Indicators */}
          <View style={styles.indicators}>
            {property.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Date Posted - Just below photos */}
          {property.createdAt && (
            <View style={styles.datePostedRow}>
              <Icon name="clock" size={14} color={colors.mutedForeground} />
              <Text style={[styles.datePostedText, { color: colors.mutedForeground }]}>
                Posted {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
              </Text>
            </View>
          )}

          {/* Title & Price */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {property.title}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {formatPrice(property.price, property.rentPeriod)}
              </Text>
              {property.bonus && (
                <Text style={[styles.bonus, { color: colors.success }]}>
                  {property.bonus}
                </Text>
              )}
            </View>
            <View style={styles.locationRow}>
              <Icon name="map-pin" size={16} color={colors.primary} />
              <Text style={[styles.location, { color: colors.mutedForeground }]}>
                {property.location}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Icon name="users" size={14} color={colors.mutedForeground} />
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                {property.type === 'connect' 
                  ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Individual') 
                  : 'Agent'}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Icon name="users" size={14} color={colors.mutedForeground} />
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                {property.condition}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Icon name="building" size={14} color={colors.mutedForeground} />
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                {property.category}
              </Text>
            </View>
          </View>

          {/* Room Details */}
          <View style={styles.roomDetails}>
            <View style={[styles.roomItem, { backgroundColor: colors.secondary }]}>
              <Icon name="bed" size={24} color={colors.mutedForeground} />
              <Text style={[styles.roomValue, { color: colors.foreground }]}>
                {property.beds} Beds
              </Text>
            </View>
            <View style={[styles.roomItem, { backgroundColor: colors.secondary }]}>
              <Icon name="bath" size={24} color={colors.mutedForeground} />
              <Text style={[styles.roomValue, { color: colors.foreground }]}>
                {property.baths} Bath
              </Text>
            </View>
            <View style={[styles.roomItem, { backgroundColor: colors.secondary }]}>
              <Icon name="sofa" size={24} color={colors.mutedForeground} />
              <Text style={[styles.roomValue, { color: colors.foreground }]}>
                {property.reception} Reception
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Features
            </Text>
            {property.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.featureText, { color: colors.foreground }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {property.description}
            </Text>
          </View>

          {/* Safety Tips */}
          {!property.isAdminPost && (
            <View style={styles.section}>
              <View style={styles.safetyHeader}>
                <Text style={[styles.sectionTitle, { color: colors.destructive }]}>
                  Safety Tips
                </Text>
                <Icon name="alert-triangle" size={20} color={colors.destructive} />
              </View>
              {safetyTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={[styles.tipNumber, { color: colors.destructive }]}>
                    {index + 1}.
                  </Text>
                  <Text style={[styles.tipText, { color: `${colors.destructive}CC` }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Agent Info */}
          <View style={styles.agentSection}>
            <Image
              source={{ uri: property.agent.avatar }}
              style={styles.agentAvatar}
              contentFit="cover"
            />
            <View style={styles.agentInfo}>
              <Text style={[styles.agentName, { color: colors.foreground }]}>
                {property.agent.name}
              </Text>
              <Text style={[styles.agentType, { color: colors.mutedForeground }]}>
                {property.type === 'connect' 
                  ? (property.connectRole === 'Landlord' ? 'Landlord' : 'Individual')
                  : property.agent.type}
              </Text>
            </View>
          </View>

          {/* CTA Button */}
          <Button
            title={user?.isPremium || (user?.connectsRemaining && user.connectsRemaining > 0) 
              ? 'Connect' 
              : 'Interested'}
            onPress={() => router.push(`/chat/${property.agent.id}?propertyId=${property.id}` as any)}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal
        visible={showFullScreen}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullScreen(false)}
      >
        <View style={styles.fullscreenModal}>
          <TouchableOpacity
            onPress={() => setShowFullScreen(false)}
            style={styles.closeButton}
          >
            <Icon name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: property.images[currentImageIndex] }}
            style={styles.fullscreenImage}
            contentFit="contain"
          />
          <Text style={styles.imageCounter}>
            {currentImageIndex + 1} / {property.images.length}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonLeft: {
    left: Spacing.lg,
  },
  navButtonRight: {
    right: Spacing.lg,
  },
  indicators: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    width: 16,
    backgroundColor: '#fff',
  },
  content: {
    padding: Spacing.lg,
  },
  datePostedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  datePostedText: {
    fontSize: FontSize.sm,
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  bonus: {
    fontSize: FontSize.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  location: {
    fontSize: FontSize.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  tagText: {
    fontSize: FontSize.sm,
    textTransform: 'capitalize',
  },
  roomDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roomItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  roomValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: FontSize.sm,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  tipText: {
    fontSize: FontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  agentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  agentType: {
    fontSize: FontSize.sm,
    textTransform: 'capitalize',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: FontSize.base,
  },
  header: {
    paddingHorizontal: Spacing.lg,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fullscreenImage: {
    width: width,
    height: width,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 60,
    color: '#fff',
    fontSize: FontSize.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
