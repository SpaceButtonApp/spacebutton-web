import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppStore } from '../lib/store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentUser, updateUser } = useAppStore();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      updateUser({ name, email, phone });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              {currentUser?.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarText}>
                  {name.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <TouchableOpacity style={[styles.changePhotoBtn, { backgroundColor: colors.card }]}>
              <Ionicons name="camera" size={20} color={colors.primary} />
              <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
});
