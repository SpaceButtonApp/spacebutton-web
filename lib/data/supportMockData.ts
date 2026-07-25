export const agents = [
  { id: 'a1', name: 'Agent Ola', initials: 'AO', color: 'purple', status: 'online' },
  { id: 'a2', name: 'Agent Mercy', initials: 'AM', color: 'coral', status: 'online' },
  { id: 'a3', name: 'Agent Musa', initials: 'MM', color: 'teal', status: 'offline' },
]

export const tickets = [
  {
    id: 'TK-0048',
    user: { name: 'Taiwo Ibrahim', initials: 'TI', color: 'blue' },
    subject: 'Viewing request ignored by agent',
    preview: 'The agent has not responded to my viewing request',
    status: 'urgent',
    time: '2 min ago',
    category: 'Agent',
    escalated: false,
    messages: [
      { id: 1, from: 'user', text: 'Hello, I requested a viewing 3 days ago and the agent has not replied me at all.', time: '10:04 AM' },
      { id: 2, from: 'agent', text: "Hi Taiwo! I'm sorry about that. Let me look into this for you right away.", time: '10:05 AM' },
      { id: 3, from: 'user', text: 'The listing is on Admiralty Way, Lekki. I have been trying to reach them since Wednesday.', time: '10:06 AM' },
      { id: 4, from: 'agent', text: "I can see the listing. I'll contact the agent directly and ensure they reach out to you within the hour.", time: '10:07 AM' },
      { id: 5, from: 'user', text: 'Okay thank you. Please make it fast.', time: '10:08 AM' },
    ],
    adminMessages: [],
  },
  {
    id: 'TK-0047',
    user: { name: 'Ngozi Bello', initials: 'NB', color: 'amber' },
    subject: 'Payment made but listing still available',
    preview: 'I paid but my listing is still showing as available',
    status: 'open',
    time: '11 min ago',
    category: 'Payment',
    escalated: true,
    messages: [
      { id: 1, from: 'user', text: 'I completed payment yesterday but the listing is still showing as available on the app.', time: '9:50 AM' },
      { id: 2, from: 'agent', text: 'Hi Ngozi, I can see your payment came through. Let me escalate this to our listings team.', time: '9:52 AM' },
    ],
    adminMessages: [
      { id: 1, from: 'agent', text: 'Admin, individual Ngozi Bello completed payment but listing is still active. Please check the database transaction status.', time: '9:55 AM' },
      { id: 2, from: 'admin', text: 'Looking into this. It appears the payment webhook was delayed. Resolving now.', time: '10:02 AM' },
    ],
  },
  {
    id: 'TK-0046',
    user: { name: 'Kunle Adebayo', initials: 'KA', color: 'teal' },
    subject: 'How to update listing photos',
    preview: 'How do I update my apartment listing photos?',
    status: 'pending',
    time: '24 min ago',
    category: 'Listing',
    escalated: false,
    messages: [
      { id: 1, from: 'user', text: 'How do I update my apartment listing photos? I cannot find the option.', time: '9:38 AM' },
    ],
    adminMessages: [],
  },
  {
    id: 'TK-0045',
    user: { name: 'Fatima Musa', initials: 'FM', color: 'coral' },
    subject: 'Refund not processed',
    preview: 'Refund not processed after 5 days',
    status: 'urgent',
    time: '1h ago',
    category: 'Refund',
    escalated: false,
    messages: [
      { id: 1, from: 'user', text: 'I have been waiting 5 days for my refund. No one has contacted me.', time: '9:05 AM' },
      { id: 2, from: 'agent', text: "I'm really sorry about the delay, Fatima. I'm chasing this with our finance team now.", time: '9:10 AM' },
    ],
    adminMessages: [],
  },
  {
    id: 'TK-0044',
    user: { name: 'Seun Okafor', initials: 'SO', color: 'purple' },
    subject: 'Wrong landlord contact on listing',
    preview: 'Landlord contact number on listing is wrong',
    status: 'resolved',
    time: '2h ago',
    category: 'Listing',
    escalated: false,
    messages: [
      { id: 1, from: 'user', text: 'The phone number for the landlord on the listing is incorrect. I have been calling the wrong person.', time: '8:30 AM' },
      { id: 2, from: 'agent', text: "Hi Seun! I've flagged this to our listings team and the contact will be updated within 30 minutes.", time: '8:35 AM' },
      { id: 3, from: 'user', text: 'Thank you!', time: '8:36 AM' },
    ],
    adminMessages: [],
  },
]

export const users = [
  { id: 'usr-001', name: 'Taiwo Ibrahim', initials: 'TI', color: 'blue', email: 'taiwo@gmail.com', role: 'Individual', status: 'active', joined: '12 Jan 2025', os: 'Android' },
  { id: 'usr-002', name: 'Ngozi Bello', initials: 'NB', color: 'amber', email: 'ngozi@yahoo.com', role: 'Agent', status: 'active', joined: '3 Feb 2025', os: 'iOS' },
  { id: 'usr-003', name: 'Kunle Adebayo', initials: 'KA', color: 'teal', email: 'kunle@outlook.com', role: 'Individual', status: 'pending_verification', joined: '20 Mar 2025', os: 'Android' },
  { id: 'usr-004', name: 'Fatima Musa', initials: 'FM', color: 'coral', email: 'fatima@gmail.com', role: 'Individual', status: 'suspended', joined: '5 Apr 2025', os: 'iOS' },
  { id: 'usr-005', name: 'Seun Okafor', initials: 'SO', color: 'purple', email: 'seun@gmail.com', role: 'Agent', status: 'active', joined: '18 May 2025', os: 'Android' },
  { id: 'usr-006', name: 'Chidi Anozie', initials: 'CA', color: 'blue', email: 'chidi@gmail.com', role: 'Individual', status: 'active', joined: '2 Jun 2025', os: 'iOS' },
  { id: 'usr-007', name: 'Amaka Obi', initials: 'AO', color: 'amber', email: 'amaka@yahoo.com', role: 'Individual', status: 'active', joined: '14 Jun 2025', os: 'Android' },
]

export const verifications = [
  {
    id: 'VRF-001', status: 'pending', submittedAt: '10 Jul 2025',
    user: { id: 'usr-003', name: 'Kunle Adebayo', initials: 'KA', color: 'teal', email: 'kunle@outlook.com' },
    docType: 'NIN', docNumber: '12345678901',
    docImage: 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?w=600&q=60',
    selfieImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=60',
  },
  {
    id: 'VRF-002', status: 'approved', submittedAt: '8 Jul 2025',
    user: { id: 'usr-002', name: 'Ngozi Bello', initials: 'NB', color: 'amber', email: 'ngozi@yahoo.com' },
    docType: 'PASSPORT', docNumber: 'A12345678',
    docImage: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&q=60',
    selfieImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=60',
  },
  {
    id: 'VRF-003', status: 'rejected', submittedAt: '5 Jul 2025', reason: 'Document photo is blurry',
    user: { id: 'usr-007', name: 'Amaka Obi', initials: 'AO', color: 'amber', email: 'amaka@yahoo.com' },
    docType: 'DRIVERS_LICENSE', docNumber: 'DL-987654321',
    docImage: 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?w=600&q=60',
    selfieImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=60',
  },
  {
    id: 'VRF-004', status: 'pending', submittedAt: '11 Jul 2025',
    user: { id: 'usr-006', name: 'Chidi Anozie', initials: 'CA', color: 'blue', email: 'chidi@gmail.com' },
    docType: 'VOTER_CARD', docNumber: 'VC-112233445',
    docImage: 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?w=600&q=60',
    selfieImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=60',
  },
]

export const listings = [
  {
    id: 'lst-1', title: 'Modern 2 Bedroom Flat', location: 'Lekki Phase 1, Lagos', price: '₦1,200,000/yr',
    owner: 'Agent Seun', status: 'active', typeTag: 'Agent', views: 142, dateAdded: '1 Jul 2025',
    description: 'A beautifully furnished two bedroom flat with 24hr light and security.',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=60'],
    amenities: ['CCTV', '24hr Light', 'Parking'],
  },
  {
    id: 'lst-2', title: 'Self-Contained Studio Apartment', location: 'Yaba, Lagos', price: '₦450,000/yr',
    owner: 'Taiwo Ibrahim', status: 'active', typeTag: 'Connect', views: 87, dateAdded: '3 Jul 2025',
    description: 'Clean studio self-contain with running water and constant light.',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60'],
    amenities: ['Running Water', '24hr Light'],
  },
  {
    id: 'lst-3', title: '3 Bedroom Duplex with BQ', location: 'Ikeja GRA, Lagos', price: '₦3,500,000/yr',
    owner: 'Agent Ngozi', status: 'pending', typeTag: 'Agent', views: 23, dateAdded: '8 Jul 2025',
    description: 'Spacious 3 bedroom duplex with boys quarters in a serene estate.',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=60'],
    amenities: ['BQ', 'Swimming Pool', 'Security', 'Parking'],
  },
  {
    id: 'lst-4', title: 'Storey Building Flat', location: 'Surulere, Lagos', price: '₦700,000/yr',
    owner: 'Chidi Anozie', status: 'active', typeTag: 'Connect', views: 56, dateAdded: '5 Jul 2025',
    description: 'Two bedroom flat in a story building, good water supply.',
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=60'],
  },
]

export const transactions = [
  { id: 'TXN-001', user: 'Taiwo Ibrahim', type: 'Subscription', amount: '₦5,000', status: 'successful', gateway: 'Paystack', os: 'Android', date: '10 Jul 2025' },
  { id: 'TXN-002', user: 'Ngozi Bello', type: 'Connect Purchase', amount: '₦2,500', status: 'successful', gateway: 'Flutterwave', os: 'iOS', date: '9 Jul 2025' },
  { id: 'TXN-003', user: 'Kunle Adebayo', type: 'Subscription', amount: '₦5,000', status: 'failed', gateway: 'Paystack', os: 'Android', date: '8 Jul 2025' },
  { id: 'TXN-004', user: 'Fatima Musa', type: 'Connect Purchase', amount: '₦2,500', status: 'pending', gateway: 'Paystack', os: 'iOS', date: '7 Jul 2025' },
  { id: 'TXN-005', user: 'Seun Okafor', type: 'Listing Fee', amount: '₦10,000', status: 'successful', gateway: 'Flutterwave', os: 'Android', date: '6 Jul 2025' },
]

export const reviews = [
  { id: 'REV-001', user: 'Taiwo Ibrahim', target: 'Agent Seun', rating: 4, text: 'Very responsive and professional. Found me a great apartment.', status: 'active', date: '9 Jul 2025' },
  { id: 'REV-002', user: 'Ngozi Bello', target: 'Agent Ngozi', rating: 2, text: 'Agent was rude and slow to respond. Not recommended.', status: 'flagged', date: '7 Jul 2025' },
  { id: 'REV-003', user: 'Chidi Anozie', target: 'Agent Musa', rating: 5, text: 'Excellent service! Very thorough and helpful throughout the process.', status: 'active', date: '5 Jul 2025' },
]

export const userReports = [
  { id: 'RPT-001', reportedUser: 'Fatima Musa', reporter: 'Taiwo Ibrahim', reason: 'Fraudulent listing with wrong contact details', date: '8 Jul 2025', status: 'pending' },
  { id: 'RPT-002', reportedUser: 'Agent Ngozi', reporter: 'Kunle Adebayo', reason: 'Agent demanded extra inspection fee', date: '6 Jul 2025', status: 'resolved' },
  { id: 'RPT-003', reportedUser: 'Chidi Anozie', reporter: 'Seun Okafor', reason: 'Listing photos do not match actual property', date: '4 Jul 2025', status: 'pending' },
]

export const categoryData = {
  labels: ['Agent', 'Payment', 'Listing', 'Refund'],
  values: [14, 9, 11, 6],
}

export const trendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [5, 8, 6, 12, 9, 4, 7],
}
