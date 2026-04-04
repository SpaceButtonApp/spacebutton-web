import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useAppStore } from '@/lib/store';

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png';

export default function SplashScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const [isReady, setIsReady] = useState(false);
  
  // Use useRef to persist animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const loaderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate loader bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(loaderAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loaderAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Set ready after a short delay to allow store hydration
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(readyTimer);
  }, [fadeAnim, scaleAnim, loaderAnim]);

  useEffect(() => {
    // Navigate after delay once ready
    if (!isReady) return;
    
    const timer = setTimeout(() => {
      if (user?.isLoggedIn) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isReady, user, router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#12121a', '#0a0a0f']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Background gradient effects */}
      <View style={styles.gradientOverlay}>
        <View style={[styles.gradientCircle, styles.gradientLeft]} />
        <View style={[styles.gradientCircle, styles.gradientRight]} />
      </View>

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={{ uri: LOGO_URL }}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>SpaceButton</Text>
        <Text style={styles.subtitle}>Connect with vacating tenants, landlords, and verified agents.</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.loader}>
          <Animated.View 
            style={[
              styles.loaderBar,
              {
                transform: [{
                  translateX: loaderAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 60],
                  }),
                }],
              },
            ]} 
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  gradientLeft: {
    top: -100,
    left: -150,
    backgroundColor: 'rgba(112, 59, 247, 0.2)',
  },
  gradientRight: {
    bottom: -100,
    right: -150,
    backgroundColor: 'rgba(112, 59, 247, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loader: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(112, 59, 247, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderBar: {
    width: '50%',
    height: '100%',
    backgroundColor: '#703BF7',
    borderRadius: 2,
  },
});
