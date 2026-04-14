import React from 'react';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// Mapping common icon names to their respective libraries
const iconMapping: Record<string, { lib: 'feather' | 'material' | 'ionicons'; name: string }> = {
  home: { lib: 'feather', name: 'home' },
  search: { lib: 'feather', name: 'search' },
  'message-circle': { lib: 'feather', name: 'message-circle' },
  settings: { lib: 'feather', name: 'settings' },
  plus: { lib: 'feather', name: 'plus' },
  bookmark: { lib: 'feather', name: 'bookmark' },
  heart: { lib: 'feather', name: 'heart' },
  user: { lib: 'feather', name: 'user' },
  mail: { lib: 'feather', name: 'mail' },
  lock: { lib: 'feather', name: 'lock' },
  eye: { lib: 'feather', name: 'eye' },
  'eye-off': { lib: 'feather', name: 'eye-off' },
  'chevron-left': { lib: 'feather', name: 'chevron-left' },
  'chevron-right': { lib: 'feather', name: 'chevron-right' },
  'chevron-down': { lib: 'feather', name: 'chevron-down' },
  x: { lib: 'feather', name: 'x' },
  check: { lib: 'feather', name: 'check' },
  'check-circle': { lib: 'feather', name: 'check-circle' },
  camera: { lib: 'feather', name: 'camera' },
  image: { lib: 'feather', name: 'image' },
  edit: { lib: 'feather', name: 'edit-2' },
  'map-pin': { lib: 'feather', name: 'map-pin' },
  clock: { lib: 'feather', name: 'clock' },
  star: { lib: 'feather', name: 'star' },
  bell: { lib: 'feather', name: 'bell' },
  wallet: { lib: 'feather', name: 'credit-card' },
  crown: { lib: 'material', name: 'crown' },
  'log-out': { lib: 'feather', name: 'log-out' },
  'help-circle': { lib: 'feather', name: 'help-circle' },
  users: { lib: 'feather', name: 'users' },
  building: { lib: 'material', name: 'office-building' },
  bed: { lib: 'ionicons', name: 'bed-outline' },
  bath: { lib: 'material', name: 'shower' },
  sofa: { lib: 'material', name: 'sofa-outline' },
  calendar: { lib: 'feather', name: 'calendar' },
  'alert-triangle': { lib: 'feather', name: 'alert-triangle' },
  grid: { lib: 'feather', name: 'grid' },
  sparkles: { lib: 'material', name: 'shimmer' },
  zap: { lib: 'feather', name: 'zap' },
  phone: { lib: 'feather', name: 'phone' },
  video: { lib: 'feather', name: 'video' },
  'more-vertical': { lib: 'feather', name: 'more-vertical' },
  send: { lib: 'feather', name: 'send' },
  sun: { lib: 'feather', name: 'sun' },
  moon: { lib: 'feather', name: 'moon' },
  ticket: { lib: 'material', name: 'ticket-outline' },
  filter: { lib: 'feather', name: 'filter' },
  'arrow-left': { lib: 'feather', name: 'arrow-left' },
  trash: { lib: 'feather', name: 'trash-2' },
  copy: { lib: 'feather', name: 'copy' },
  share: { lib: 'feather', name: 'share-2' },
  info: { lib: 'feather', name: 'info' },
  'alert-circle': { lib: 'feather', name: 'alert-circle' },
};

export function Icon({ name, size = 24, color = '#ffffff' }: IconProps) {
  const mapping = iconMapping[name];
  
  if (!mapping) {
    // Default to Feather if icon not found
    return <Feather name="circle" size={size} color={color} />;
  }

  switch (mapping.lib) {
    case 'feather':
      return <Feather name={mapping.name as any} size={size} color={color} />;
    case 'material':
      return <MaterialCommunityIcons name={mapping.name as any} size={size} color={color} />;
    case 'ionicons':
      return <Ionicons name={mapping.name as any} size={size} color={color} />;
    default:
      return <Feather name="circle" size={size} color={color} />;
  }
}

export { Feather, MaterialCommunityIcons, Ionicons };
