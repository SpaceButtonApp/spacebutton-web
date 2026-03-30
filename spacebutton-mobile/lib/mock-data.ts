export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rentPeriod?: 'monthly' | 'yearly';
  images: string[];
  videoUrl?: string;
  type: 'connect' | 'agent' | 'shortlet' | 'properties';
  listingType?: 'connect' | 'agent';
  condition: 'rent' | 'roommate' | 'flatmate';
  category: 'flat' | 'self-con' | 'duplex' | 'storey' | 'penthouse';
  beds: number;
  baths: number;
  reception: number;
  features: string[];
  description: string;
  verified: boolean;
  saved: boolean;
  photoCount: number;
  bonus?: string;
  rentDueDate?: string;
  totalPackage?: number;
  agent: Agent;
  ownerId: string;
  connectRole?: 'Tenant' | 'Landlord';
  landlordPresence?: 'stays' | 'not-stays';
  balconies?: number;
  isAdminPost?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  type: 'individual' | 'agent';
  listings: number;
  closed: number;
  rating: number;
  online: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  user: Agent;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp?: Date;
  createdAt?: string;
  read: boolean;
  type: 'recent' | 'old' | 'marked' | 'done_deal' | 'general';
  propertyId?: string;
}

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Indica Watson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    type: 'agent',
    listings: 30,
    closed: 12,
    rating: 4.8,
    online: true,
  },
  {
    id: '2',
    name: 'Milano',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    type: 'individual',
    listings: 5,
    closed: 2,
    rating: 4.5,
    online: true,
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    type: 'agent',
    listings: 45,
    closed: 28,
    rating: 4.9,
    online: false,
  },
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Two Bedroom Flat',
    location: 'First Gate, Ojo, Lagos State',
    price: 900000,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    ],
    type: 'agent',
    listingType: 'agent',
    condition: 'flatmate',
    category: 'duplex',
    beds: 2,
    baths: 2,
    reception: 1,
    features: ['Luxurious apartment', 'Storey Building', 'Landlord Stays in compound', 'Pet Allowed', 'Parking Lot'],
    description: 'Beautiful two bedroom apartment with modern amenities and great location.',
    verified: true,
    saved: true,
    photoCount: 12,
    bonus: '+75,000 5% Bonus',
    rentDueDate: '15th April 2023',
    agent: mockAgents[0],
    ownerId: '1',
  },
  {
    id: '2',
    title: 'Four Bedroom Flat',
    location: 'Ayobo, Iyana Ipaja, Lagos State',
    price: 1000000,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
    ],
    type: 'agent',
    listingType: 'agent',
    condition: 'flatmate',
    category: 'storey',
    beds: 4,
    baths: 3,
    reception: 1,
    features: ['Spacious rooms', 'Modern kitchen', 'Parking space', 'Security'],
    description: 'Beautiful four bedroom apartment in a serene environment.',
    verified: false,
    saved: false,
    photoCount: 12,
    agent: mockAgents[1],
    ownerId: '2',
  },
  {
    id: '3',
    title: '2 Bedroom Flat',
    location: 'First Gate, Ojo, Lagos',
    price: 1500000,
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
    ],
    type: 'connect',
    listingType: 'connect',
    condition: 'roommate',
    category: 'duplex',
    beds: 2,
    baths: 2,
    reception: 1,
    features: ['Modern design', 'Swimming pool', '24/7 security', 'Gym access'],
    description: 'Premium apartment with world-class amenities.',
    verified: true,
    saved: false,
    photoCount: 12,
    bonus: '+75,000 5% Bonus',
    rentDueDate: '15th April 2023',
    agent: mockAgents[0],
    ownerId: '1',
    connectRole: 'Tenant',
  },
  {
    id: '4',
    title: 'Three Bedroom Duplex',
    location: 'Lekki Phase 1, Lagos',
    price: 2500000,
    images: [
      'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?w=800&h=600&fit=crop',
    ],
    type: 'connect',
    listingType: 'connect',
    condition: 'flatmate',
    category: 'duplex',
    beds: 3,
    baths: 3,
    reception: 2,
    features: ['Luxury finish', 'Smart home', 'Private garden', 'Guest house'],
    description: 'Exquisite duplex in the heart of Lekki with premium finishes.',
    verified: true,
    saved: true,
    photoCount: 15,
    agent: mockAgents[1],
    ownerId: '2',
    connectRole: 'Landlord',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    user: mockAgents[1],
    lastMessage: "Hello, I'm interested in an apartment located in Castro, 3 bedrooms.",
    timestamp: new Date('2024-01-15T10:30:00'),
    unread: 2,
  },
  {
    id: '2',
    user: mockAgents[2],
    lastMessage: 'Can we schedule a viewing for tomorrow?',
    timestamp: new Date('2024-01-14T15:45:00'),
    unread: 0,
  },
  {
    id: '3',
    user: mockAgents[0],
    lastMessage: 'The apartment is still available.',
    timestamp: new Date('2024-01-13T09:20:00'),
    unread: 1,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Message',
    message: 'You have a new message from Milano',
    timestamp: new Date('2024-01-15T10:30:00'),
    read: false,
    type: 'recent',
  },
  {
    id: '2',
    title: 'Property Viewed',
    message: 'Your listing has been viewed 50 times',
    timestamp: new Date('2024-01-14T15:00:00'),
    read: false,
    type: 'recent',
  },
  {
    id: '3',
    title: 'Payment Received',
    message: 'You have received N2,000 for premium subscription',
    timestamp: new Date('2024-01-13T09:00:00'),
    read: true,
    type: 'old',
  },
];

export const safetyTips = [
  'Do not pay inspection fee to any agent.',
  'Only pay Rental fee after you verify the Landlord',
  'Ensure you meet the Individual/Agent in an Open location',
  'The Individual/Agent does not represent SpaceButton',
  'Make sure the Individual is living in the apartment',
  'All communication should be on the app',
  'Toggle the done deal button after successful transaction',
];

export const formatPrice = (price: number, rentPeriod?: 'monthly' | 'yearly'): string => {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('NGN', 'N');
  
  if (rentPeriod) {
    return `${formatted}/${rentPeriod === 'monthly' ? 'month' : 'year'}`;
  }
  return formatted;
};
