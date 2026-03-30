import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { PropertyCard } from '@/components/PropertyCard';
import { BottomNav } from '@/components/BottomNav';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { properties, closedProperties } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filters = ['All', 'Flat', 'Duplex', 'Self-con', 'Storey'];

  const filteredProperties = properties.filter((property) => {
    if (closedProperties.includes(property.id)) return false;
    
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilters.length === 0 || 
      activeFilters.includes('All') ||
      activeFilters.includes(property.category);
    
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      setActiveFilters(['All']);
    } else {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'All');
        if (newFilters.includes(filter)) {
          return newFilters.filter(f => f !== filter);
        }
        return [...newFilters, filter];
      });
    }
  };

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
        <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>
        
        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Icon name="search" size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by location, type..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter) || (filter === 'All' && activeFilters.length === 0);
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => toggleFilter(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.secondary,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? '#fff' : colors.mutedForeground },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
          {filteredProperties.length} properties found
        </Text>
        
        {filteredProperties.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="search" size={48} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Results</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} variant="compact" />
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
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    paddingVertical: Spacing.sm,
  },
  filtersScroll: {
    marginTop: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  resultsCount: {
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
