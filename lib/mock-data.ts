// Mock data for SpaceButton app

export interface Property {
  id: string
  title: string
  location: string
  price: number
  images: string[]
  videoUrl?: string
  type: 'connect' | 'agent' | 'shortlet' | 'properties'
  condition: 'rent' | 'roommate' | 'flatmate'
  category: 'flat' | 'self-con' | 'duplex' | 'storey' | 'penthouse'
  beds: number
  baths: number
  reception: number
  features: string[]
  description: string
  verified: boolean
  saved: boolean
  photoCount: number
  bonus?: string
  rentDueDate?: string
  totalPackage?: number
  agent: Agent
  ownerId: string
  connectRole?: 'Tenant' | 'Landlord'
  landlordPresence?: 'stays' | 'not-stays'
  balconies?: number
}

export interface Agent {
  id: string
  name: string
  avatar: string
  type: 'individual' | 'agent'
  listings: number
  closed: number
  rating: number
  online: boolean
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  isOwn: boolean
}

export interface Conversation {
  id: string
  user: Agent
  lastMessage: string
  timestamp: Date
  unread: number
}

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: 'recent' | 'old' | 'marked'
}

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: Date
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
]

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
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    ],
    type: 'agent',
    condition: 'flatmate',
    category: 'duplex',
    beds: 2,
    baths: 2,
    reception: 1,
    features: ['Luxurious apartment', 'Storey Building', 'Landlord Stays in the compound', 'Estate, Pet Allowed - Parking Lot - Garden', '1 Balcony'],
    description: 'The Blade stands at 52 stories tall and will consist of 414 premium one, two, three-bedroom and penthouse luxury residential apartments which will provide you with breath-taking skyline views.',
    verified: true,
    saved: true,
    photoCount: 12,
    bonus: '+₦75,000 5% Bonus',
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
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
    ],
    type: 'agent',
    condition: 'flatmate',
    category: 'storey',
    beds: 4,
    baths: 3,
    reception: 1,
    features: ['Spacious rooms', 'Modern kitchen', 'Parking space', 'Security'],
    description: 'Beautiful four bedroom apartment in a serene environment with modern amenities.',
    verified: false,
    saved: false,
    photoCount: 12,
    agent: mockAgents[1],
    ownerId: '2',
  },
  {
    id: '3',
    title: 'Mini Flat, Storey Building',
    location: 'Toll Gate, Sango Ota, Ogun',
    price: 700000,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=600&fit=crop',
    ],
    type: 'agent',
    condition: 'roommate',
    category: 'storey',
    beds: 1,
    baths: 1,
    reception: 1,
    features: ['Affordable', 'Good location', 'Clean environment'],
    description: 'Cozy mini flat perfect for singles or young couples.',
    verified: false,
    saved: true,
    photoCount: 12,
    agent: mockAgents[2],
    ownerId: '3',
  },
  {
    id: '4',
    title: '2 Bedroom Flat',
    location: 'First Gate, Ojo, Lagos',
    price: 1500000,
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    ],
    type: 'connect',
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
    bonus: '+₦75,000 5% Bonus',
    rentDueDate: '15th April 2023',
    agent: mockAgents[0],
    ownerId: '1',
  },
  {
    id: '5',
    title: 'Three Bedroom Duplex',
    location: 'Lekki Phase 1, Lagos',
    price: 2500000,
    images: [
      'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop',
    ],
    type: 'connect',
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
  },
  {
    id: '6',
    title: 'Studio Apartment',
    location: 'Victoria Island, Lagos',
    price: 800000,
    images: [
      'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752734-48c74332b873?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
    ],
    type: 'connect',
    condition: 'rent',
    category: 'flat',
    beds: 1,
    baths: 1,
    reception: 0,
    features: ['Fully furnished', 'City view', 'Serviced', 'WiFi included'],
    description: 'Modern studio apartment perfect for professionals.',
    verified: true,
    saved: false,
    photoCount: 8,
    agent: mockAgents[2],
    ownerId: '3',
  },
]

export const mockConversations: Conversation[] = [
  {
    id: '1',
    user: mockAgents[1],
    lastMessage: "Hello, I'm interested in an apartment located in Castro, 3 bedrooms on sale.",
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
]

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    content: "Hello, I'm interested in an apartment located in Castro, 3 bedrooms on sale. Can we schedule a visit please?",
    timestamp: new Date('2024-01-15T10:00:00'),
    isOwn: false,
  },
  {
    id: '2',
    senderId: '1',
    receiverId: '2',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    timestamp: new Date('2024-01-15T10:05:00'),
    isOwn: true,
  },
  {
    id: '3',
    senderId: '1',
    receiverId: '2',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    timestamp: new Date('2024-01-15T10:10:00'),
    isOwn: true,
  },
  {
    id: '4',
    senderId: '2',
    receiverId: '1',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec fringilla quam eu faci lisis mollis.',
    timestamp: new Date('2024-01-15T10:15:00'),
    isOwn: false,
  },
  {
    id: '5',
    senderId: '1',
    receiverId: '2',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    timestamp: new Date('2024-01-15T10:20:00'),
    isOwn: true,
  },
  {
    id: '6',
    senderId: '1',
    receiverId: '2',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    timestamp: new Date('2024-01-15T10:25:00'),
    isOwn: true,
  },
]

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
    message: 'You have received ₦2,000 for premium subscription',
    timestamp: new Date('2024-01-13T09:00:00'),
    read: true,
    type: 'old',
  },
  {
    id: '4',
    title: 'New Listing Approved',
    message: 'Your 2 bedroom flat listing has been approved',
    timestamp: new Date('2024-01-12T14:30:00'),
    read: true,
    type: 'marked',
  },
  {
    id: '5',
    title: 'Deal Closed',
    message: 'Congratulations! You have closed a deal',
    timestamp: new Date('2024-01-11T11:00:00'),
    read: true,
    type: 'old',
  },
]

export const mockReviews: Review[] = [
  {
    id: '1',
    userId: '3',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Excellent service! Very professional and responsive.',
    date: new Date('2024-01-10'),
  },
  {
    id: '2',
    userId: '4',
    userName: 'Jane Smith',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    comment: 'Great experience overall. Would recommend.',
    date: new Date('2024-01-05'),
  },
  {
    id: '3',
    userId: '5',
    userName: 'Mike Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Found my dream apartment through this agent!',
    date: new Date('2023-12-28'),
  },
]

export const locations = [
  'Lagos State',
  'Ogun State',
  'Rivers State',
  'Federal Capital Territory',
  'Abia State',
  'Adamawa State',
  'Akwa Ibom State',
  'Anambra State',
  'Bauchi State',
  'Bayelsa State',
  'Benue State',
  'Borno State',
  'Cross River State',
  'Delta State',
  'Ebonyi State',
  'Edo State',
  'Ekiti State',
  'Enugu State',
  'Gombe State',
  'Imo State',
  'Jigawa State',
  'Kaduna State',
  'Kano State',
  'Katsina State',
  'Kebbi State',
  'Kogi State',
  'Kwara State',
  'Nasarawa State',
  'Niger State',
  'Ondo State',
  'Osun State',
  'Oyo State',
  'Plateau State',
  'Sokoto State',
  'Taraba State',
  'Yobe State',
  'Zamfara State',
]

export const apartmentTypes = [
  'Flat',
  'Self Contain',
  'Duplex',
  'Storey Building',
  'Penthouse',
]

export const priceRanges = {
  min: [100000, 200000, 300000, 500000, 1000000],
  max: [500000, 1000000, 1500000, 2000000, 5000000],
}

export const currentUser: Agent = {
  id: 'current',
  name: 'Indica Watson',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  type: 'agent',
  listings: 30,
  closed: 12,
  rating: 4.8,
  online: true,
}

export interface User {
  id: string
  name: string
  avatar: string
  type: 'individual' | 'agent'
  email: string
  phone: string
  stats: {
    listings: number
    closed: number
    rating: number
  }
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Indica Watson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    type: 'agent',
    email: 'indica@example.com',
    phone: '+234 123 456 7890',
    stats: { listings: 30, closed: 12, rating: 4.8 },
  },
  {
    id: '2',
    name: 'Milano',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    type: 'individual',
    email: 'milano@example.com',
    phone: '+234 987 654 3210',
    stats: { listings: 5, closed: 2, rating: 4.5 },
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    type: 'agent',
    email: 'sarah@example.com',
    phone: '+234 555 123 4567',
    stats: { listings: 45, closed: 28, rating: 4.9 },
  },
]

export const safetyTips = [
  "Do not pay any inspection fee If you've not seen more than two Apartment",
  'Only pay Rental fee, Sales fee or any upfront payment after you verity the Landlord',
  'Ensure you meet the Individual/Agent in an Open location',
  'The Individual/Agent does not represent SpaceButton',
  'Make sure the Individual is living in the apartment by checking from two or more neighbours',
  'All form of communication should be on the app not outside',
  'After successful transaction between both parties both parties should make sure they toogle the done deal button in the chat section. To avoid the lister giving same apartment to someone else',
]

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('NGN', '₦')
}
