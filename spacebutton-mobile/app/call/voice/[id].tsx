import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAppStore } from '../../../lib/store';
import { mockAgents, mockConversations } from '../../../lib/mock-data';

const { width } = Dimensions.get('window');

type CallState = 'calling' | 'ongoing';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

export default function VoiceCallScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { properties, conversations } = useAppStore();

  const [callState, setCallState] = useState<CallState>('calling');
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Find the user/agent by ID
  const caller = useMemo(() => {
    // First check store conversations
    const storeConv = conversations.find((c) => c.user?.id === id);
    if (storeConv?.user) return storeConv.user;
    
    // Check mock conversations
    const mockConv = mockConversations.find((c) => c.user?.id === id);
    if (mockConv?.user) return mockConv.user;
    
    // Check properties for agent
    const property = properties.find((p) => p.agent?.id === id);
    if (property?.agent) return property.agent;
    
    // Finally check mock agents
    return mockAgents.find((a) => a.id === id);
  }, [id, conversations, properties]);

  const callerName = caller?.name || 'Unknown';
  const callerAvatar = caller?.avatar || DEFAULT_AVATAR;

  useEffect(() => {
    if (callState === 'calling') {
      const timer = setTimeout(() => {
        setCallState('ongoing');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [callState]);

  useEffect(() => {
    if (callState === 'ongoing') {
      const interval = setInterval(() => {
        setCallTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  if (!caller) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            User not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.text }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBackButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {callState === 'calling' ? 'Calling...' : callerName}
          </Text>
          {callState === 'ongoing' && (
            <View style={[styles.timeBadge, { backgroundColor: colors.card }]}>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {formatTime(callTime)}
              </Text>
            </View>
          )}
        </View>
        <View style={{ width: 48 }} />
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {callState === 'ongoing' && (
            <View style={[styles.pulseRing, { borderColor: colors.primary }]} />
          )}
          <Image
            source={{ uri: callerAvatar }}
            style={[styles.avatar, callState === 'ongoing' && styles.avatarOngoing]}
          />
        </View>
        {callState === 'calling' && (
          <Text style={[styles.callerName, { color: colors.text }]}>{callerName}</Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsSection}>
        <View style={[styles.controlsBar, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
            style={[
              styles.controlButton,
              { backgroundColor: isSpeakerOn ? colors.primary : colors.background }
            ]}
          >
            <Ionicons 
              name="volume-high" 
              size={24} 
              color={isSpeakerOn ? '#FFFFFF' : colors.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setIsMuted(!isMuted)}
            style={[
              styles.controlButton,
              { backgroundColor: isMuted ? colors.primary : colors.background }
            ]}
          >
            <Ionicons 
              name="mic-off" 
              size={24} 
              color={isMuted ? '#FFFFFF' : colors.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.background }]}
            onPress={() => router.push(`/call/video/${id}` as any)}
          >
            <Ionicons name="videocam" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleEndCall}
            style={[styles.controlButton, { backgroundColor: '#EF4444' }]}
          >
            <Ionicons name="call" size={24} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleEndCall}
          style={styles.endCallButton}
        >
          <Text style={styles.endCallText}>End Call</Text>
          <View style={styles.endCallIcon}>
            <Ionicons name="call" size={20} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  timeBadge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 14,
  },
  avatarSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    opacity: 0.3,
  },
  avatar: {
    width: 192,
    height: 192,
    borderRadius: 96,
  },
  avatarOngoing: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  callerName: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: '600',
  },
  controlsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 32,
    paddingVertical: 16,
    gap: 16,
  },
  endCallText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  endCallIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
