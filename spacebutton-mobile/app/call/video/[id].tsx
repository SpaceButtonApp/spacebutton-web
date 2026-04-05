import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAppStore } from '../../../lib/store';
import { mockAgents, mockConversations } from '../../../lib/mock-data';

const { width, height } = Dimensions.get('window');

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

export default function VideoCallScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { properties, conversations } = useAppStore();

  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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
    const interval = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
            style={[styles.goBackButton, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.text }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Remote video (full screen background) */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop' }}
        style={styles.remoteVideo}
      >
        {/* Overlay */}
        <View style={styles.overlay} />
        
        <SafeAreaView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{callerName}</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{formatTime(callTime)}</Text>
              </View>
            </View>
            <View style={{ width: 48 }} />
          </View>

          {/* Local video (picture-in-picture) */}
          <View style={styles.pipContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop' }}
              style={styles.pipVideo}
            />
          </View>

          {/* Controls */}
          <View style={styles.controlsSection}>
            <View style={styles.controlsBar}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => router.push(`/chat/${id}` as any)}
              >
                <Ionicons name="chatbubble" size={24} color="#000000" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setIsMuted(!isMuted)}
                style={[
                  styles.controlButton,
                  isMuted && styles.controlButtonActive
                ]}
              >
                <Ionicons 
                  name="mic-off" 
                  size={24} 
                  color={isMuted ? '#FFFFFF' : '#000000'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setIsVideoOff(!isVideoOff)}
                style={[
                  styles.controlButton,
                  isVideoOff && styles.controlButtonActive
                ]}
              >
                <Ionicons 
                  name="videocam-off" 
                  size={24} 
                  color={isVideoOff ? '#FFFFFF' : '#000000'} 
                />
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
      </ImageBackground>
    </View>
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
  goBackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  content: {
    flex: 1,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeBadge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  pipContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
  },
  pipVideo: {
    width: 112,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#3B82F6',
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
