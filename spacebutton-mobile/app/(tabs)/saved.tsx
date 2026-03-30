import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { PropertyCard } from '@/components/PropertyCard';
import { BottomNav } from '@/components/BottomNav';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function SavedScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { properties, savedProperties } = useAppStore();

  const savedPropertyList = properties.filter((p) => savedProperties.includes(p.id));

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
        <Text style={[styles.title, { color: colors.foreground }]}>Saved</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {savedPropertyList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="bookmark" size={48} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Saved Properties</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Properties you save will appear here
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {savedPropertyList.length} saved properties
            </Text>
            {savedPropertyList.map((property) => (
              <PropertyCard key={property.id} property={property} variant="compact" />
            ))}
          </>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  count: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
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
  },
});
