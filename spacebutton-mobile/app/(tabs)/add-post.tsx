import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/Icons';
import { mockAgents } from '@/lib/mock-data';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const categories = ['flat', 'self-con', 'duplex', 'storey', 'penthouse'];
const conditions = ['rent', 'roommate', 'flatmate'];
const listingTypes = ['connect', 'agent'];

export default function AddPostScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, addProperty } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
    beds: '1',
    baths: '1',
    reception: '1',
    category: 'flat',
    condition: 'rent',
    listingType: 'connect',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.location || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addProperty({
      id: `property-${Date.now()}`,
      title: formData.title,
      location: formData.location,
      price: parseInt(formData.price, 10),
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      ],
      type: formData.listingType as any,
      listingType: formData.listingType as any,
      condition: formData.condition as any,
      category: formData.category as any,
      beds: parseInt(formData.beds, 10),
      baths: parseInt(formData.baths, 10),
      reception: parseInt(formData.reception, 10),
      features: ['New listing'],
      description: formData.description,
      verified: false,
      saved: false,
      photoCount: 1,
      agent: mockAgents[0],
      ownerId: user?.id || 'unknown',
      connectRole: 'Landlord',
    });

    setLoading(false);
    Alert.alert('Success', 'Your listing has been posted!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

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
        <Text style={[styles.title, { color: colors.foreground }]}>Post Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload */}
        <TouchableOpacity
          style={[styles.imageUpload, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Icon name="camera" size={32} color={colors.mutedForeground} />
          <Text style={[styles.imageUploadText, { color: colors.mutedForeground }]}>
            Add Photos
          </Text>
        </TouchableOpacity>

        {/* Listing Type */}
        <Text style={[styles.label, { color: colors.foreground }]}>Listing Type</Text>
        <View style={styles.optionsRow}>
          {listingTypes.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFormData({ ...formData, listingType: type })}
              style={[
                styles.optionButton,
                {
                  backgroundColor: formData.listingType === type ? colors.primary : colors.secondary,
                  borderColor: formData.listingType === type ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: formData.listingType === type ? '#fff' : colors.mutedForeground },
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Title *"
          placeholder="e.g., Two Bedroom Flat"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />

        <Input
          label="Location *"
          placeholder="e.g., First Gate, Ojo, Lagos"
          leftIcon="map-pin"
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
        />

        <Input
          label="Price (NGN) *"
          placeholder="e.g., 500000"
          keyboardType="numeric"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
        />

        {/* Category */}
        <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setFormData({ ...formData, category: cat })}
              style={[
                styles.chipButton,
                {
                  backgroundColor: formData.category === cat ? colors.primary : colors.secondary,
                  borderColor: formData.category === cat ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: formData.category === cat ? '#fff' : colors.mutedForeground },
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Condition */}
        <Text style={[styles.label, { color: colors.foreground }]}>Condition</Text>
        <View style={styles.optionsRow}>
          {conditions.map((cond) => (
            <TouchableOpacity
              key={cond}
              onPress={() => setFormData({ ...formData, condition: cond })}
              style={[
                styles.optionButton,
                {
                  backgroundColor: formData.condition === cond ? colors.primary : colors.secondary,
                  borderColor: formData.condition === cond ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: formData.condition === cond ? '#fff' : colors.mutedForeground },
                ]}
              >
                {cond.charAt(0).toUpperCase() + cond.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Room Details */}
        <Text style={[styles.label, { color: colors.foreground }]}>Room Details</Text>
        <View style={styles.roomRow}>
          <View style={styles.roomInput}>
            <Text style={[styles.roomLabel, { color: colors.mutedForeground }]}>Beds</Text>
            <Input
              placeholder="1"
              keyboardType="numeric"
              value={formData.beds}
              onChangeText={(text) => setFormData({ ...formData, beds: text })}
            />
          </View>
          <View style={styles.roomInput}>
            <Text style={[styles.roomLabel, { color: colors.mutedForeground }]}>Baths</Text>
            <Input
              placeholder="1"
              keyboardType="numeric"
              value={formData.baths}
              onChangeText={(text) => setFormData({ ...formData, baths: text })}
            />
          </View>
          <View style={styles.roomInput}>
            <Text style={[styles.roomLabel, { color: colors.mutedForeground }]}>Reception</Text>
            <Input
              placeholder="1"
              keyboardType="numeric"
              value={formData.reception}
              onChangeText={(text) => setFormData({ ...formData, reception: text })}
            />
          </View>
        </View>

        <Input
          label="Description"
          placeholder="Describe the property..."
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          containerStyle={{ marginBottom: Spacing['2xl'] }}
        />

        <Button
          title={loading ? 'Posting...' : 'Post Listing'}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginBottom: Spacing['3xl'] }}
        />
      </ScrollView>
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
  imageUpload: {
    height: 150,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  imageUploadText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  horizontalScroll: {
    marginBottom: Spacing.lg,
  },
  chipButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  roomRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roomInput: {
    flex: 1,
  },
  roomLabel: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
});
