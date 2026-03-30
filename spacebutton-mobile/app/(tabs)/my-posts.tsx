import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../lib/store';
import { properties } from '../../lib/mock-data';
import PropertyCard from '../../components/PropertyCard';

export default function MyPostsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentUser } = useAppStore();

  // Filter properties by current user (mock)
  const myProperties = properties.slice(0, 3);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="home-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No listings yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Start posting your properties to reach potential tenants
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/add-post')}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Property</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Posts</Text>
        <TouchableOpacity 
          style={styles.addIconButton}
          onPress={() => router.push('/(tabs)/add-post')}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {myProperties.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={myProperties}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <PropertyCard property={item} />
              <View style={[styles.actions, { borderTopColor: colors.border }]}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                    23 views
                  </Text>
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                  <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  cardContainer: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: -8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginTop: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
