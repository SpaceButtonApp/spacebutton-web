import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppUser,
  Verification,
  Listing,
  MessageThread,
  Transaction,
  Review,
  Report,
  AppNotification,
  WaitlistEntry,
  AdminProfile,
  SupportAgent,
} from "@/lib/types/admin";

// Bump this suffix whenever seed data shape changes, so browsers with an old
// cached snapshot in localStorage get a fresh reseed instead of stale data.
export const ADMIN_STORAGE_KEY = "spacebutton-admin-storage-v3";

// ----------------------------------------------------------------------------
// Seed data — small, realistic starting datasets. Everything derived (stats,
// counts, filters) is computed from these arrays, never hardcoded.
// ----------------------------------------------------------------------------

const AVATAR_COLORS = [
  "#7c3aed", "#a855f7", "#8b5cf6", "#6366f1", "#c026d3", "#9333ea",
];

const NG_LOCATIONS = [
  "First Gate, Ojo, Lagos State",
  "Ayobo, Iyana Ipaja, Lagos State",
  "Toll Gate, Sango Ota, Ogun",
  "Lekki Phase 1, Lagos",
  "Wuse 2, Abuja",
  "GRA, Port Harcourt, Rivers",
  "Independence Layout, Enugu",
  "Bodija, Ibadan, Oyo",
];

const FIRST_NAMES = [
  "Adeola", "Chinedu", "Fathiu", "Ngozi", "Tunde", "Amaka", "Bakare", "Grace",
  "Emeka", "Halima", "Ibrahim", "Kemi", "Musa", "Ngozika", "Olamide", "Precious",
  "Rasheed", "Sarah", "Tobi", "Uchenna", "Victor", "Yemi", "Zainab", "David",
];
const LAST_NAMES = [
  "Samuel", "Okafor", "Olamilekan", "Balogun", "Sylvanus", "Johnson", "Musa",
  "Watson", "Brown", "Williams", "Adeyemi", "Eze", "Goodness", "Mujidat",
  "Kingsley", "Sunmola", "Paul", "Dame", "Grace", "Elex",
];

let idCounter = 1;
function nextId(prefix: string) {
  return `${prefix}-${(idCounter++).toString(36)}${Date.now().toString(36).slice(-4)}`;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function seedUsers(): AppUser[] {
  const users: AppUser[] = [];
  for (let i = 0; i < 40; i++) {
    const first = randomFrom(FIRST_NAMES);
    const last = randomFrom(LAST_NAMES);
    const role: AppUser["role"] = i < 12 ? "agent" : "individual";
    const status: AppUser["status"] =
      i === 3 ? "pending_verification" : i === 7 ? "suspended" : "active";
    users.push({
      id: nextId("usr"),
      userId: nextId("uid").toUpperCase(),
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}${last.toLowerCase()}${i}@gmail.com`,
      phone: `+234${8000000000 + Math.floor(Math.random() * 900000000)}`,
      role,
      status,
      joinDate: daysAgo(Math.floor(Math.random() * 180)),
      avatarColor: randomFrom(AVATAR_COLORS),
      referralCode: `SB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      connects: Math.floor(Math.random() * 20),
      bio: "SpaceButton platform member.",
    });
  }
  // Wire up referrals: ~40% of users were referred by an earlier user in the list.
  users.forEach((u, i) => {
    if (i > 3 && Math.random() < 0.4) {
      const referrer = users[Math.floor(Math.random() * i)];
      u.referredBy = referrer.referralCode;
    }
  });
  return users.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
}

function seedSupportAgents(): SupportAgent[] {
  return [
    {
      id: nextId("sup"),
      fullName: "Blessing Adaeze",
      email: "blessing.support@spacebutton.net",
      createdDate: daysAgo(20),
      avatarColor: "#8b5cf6",
    },
    {
      id: nextId("sup"),
      fullName: "Chidi Obinna",
      email: "chidi.support@spacebutton.net",
      createdDate: daysAgo(8),
      avatarColor: "#6366f1",
    },
  ];
}

function seedVerifications(users: AppUser[]): Verification[] {
  const idTypes: Verification["idType"][] = ["NIN", "Drivers License", "Voter's Card", "Passport"];
  return users.slice(0, 22).map((u, i) => ({
    id: nextId("ver"),
    userId: u.id,
    idType: randomFrom(idTypes),
    idNumber: Math.random().toString().slice(2, 13),
    idImageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
    selfieImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    status: i < 18 ? "verified" : i < 20 ? "pending" : "not_verified",
    submittedDate: daysAgo(Math.floor(Math.random() * 60)),
  }));
}

function seedListings(users: AppUser[]): Listing[] {
  const agentUsers = users.filter((u) => u.role === "agent");
  const individualUsers = users.filter((u) => u.role === "individual");
  const titles = [
    "Two Bedroom Flat", "Four Bedroom Flat", "Mini Flat, Storey Building",
    "2 Bedroom Flat", "Three Bedroom Duplex", "Self Contain", "Studio Apartment",
    "Five Bedroom Detached House", "One Bedroom Flat", "Shop Space",
    "Terraced Duplex", "Penthouse Apartment",
  ];
  const descriptions = [
    "Newly renovated two bedroom flat with tiled floors, POP ceiling, and 24/7 water supply. Serene neighborhood with good road network and close to major bus stops.",
    "Spacious four bedroom flat with fitted kitchen, ample parking space, and constant power supply. Suitable for a family, close to schools and markets.",
    "Well-maintained mini flat in a storey building with private entrance. Ideal for a single professional or small family. Prepaid meter installed.",
    "Cozy 2 bedroom flat in a gated compound with 24-hour security. Features include a modern kitchen, spacious living room, and balcony.",
    "Brand new three bedroom duplex with boys' quarters, ensuite bedrooms, and a private compound. Excellent for families seeking comfort and privacy.",
    "Affordable self contain apartment with kitchen space and private bathroom. Good for students or young professionals starting out.",
    "Compact studio apartment perfect for a single occupant. Comes with basic fittings and is located close to the main road for easy transportation.",
    "Luxury five bedroom detached house with swimming pool, large compound, and modern finishing throughout. A statement home for the discerning buyer.",
    "Neat one bedroom flat with tiled interior and reliable water supply. Located in a quiet, family-friendly estate.",
    "Commercial shop space on a busy road with high foot traffic. Suitable for retail, boutique, or office use.",
    "Modern terraced duplex within a serviced estate. Comes with 24-hour security, good drainage, and easy access to major roads.",
    "Exclusive penthouse apartment with panoramic views, premium finishing, and access to estate amenities including a gym and pool.",
  ];
  const images = [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
  ];
  return titles.map((title, i) => {
    // Listing type follows the owner: agents post as "agent" listings, individuals post as "connect" listings.
    const postAsIndividual = i % 5 === 0 && individualUsers.length > 0;
    const owner = postAsIndividual ? randomFrom(individualUsers) : randomFrom(agentUsers.length ? agentUsers : users);
    const type: Listing["type"] = owner.role === "individual" ? "connect" : "agent";
    // Seed a handful of listings as pending approval so the review UI has real data to show.
    const approval: Listing["approval"] = i === 2 || i === 5 || i === 9 ? "pending" : "approved";
    return {
      id: nextId("lst"),
      title,
      ownerId: owner.id,
      location: randomFrom(NG_LOCATIONS),
      price: (Math.floor(Math.random() * 20) + 5) * 100000,
      type,
      status: "active",
      approval,
      createdDate: daysAgo(Math.floor(Math.random() * 90)),
      images,
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      sittingRooms: Math.floor(Math.random() * 2) + 1,
      balconies: Math.floor(Math.random() * 2),
      category: randomFrom(["Duplex", "Flat", "Bungalow", "Self Contain"]),
      description: descriptions[i] ?? "No description provided by the owner.",
      conversationsCount: Math.floor(Math.random() * 8),
      flagCount: 0,
    };
  });
}

function seedMessages(users: AppUser[]): MessageThread[] {
  return users.slice(0, 8).map((u, i) => ({
    id: nextId("msg"),
    userId: u.id,
    lastMessage: "Hello! Welcome to SpaceButton Support. How can I help you today?",
    lastMessageDate: daysAgo(i),
    unreadCount: i === 2 || i === 6 ? 1 : 0,
    messages: [
      {
        id: nextId("m"),
        sender: "admin",
        text: "Hello! Welcome to SpaceButton Support. How can I help you today?",
        date: daysAgo(i),
      },
    ],
  }));
}

function seedTransactions(users: AppUser[]): Transaction[] {
  const connectPacks: { connects: number; amount: number }[] = [
    { connects: 1, amount: 2000 },
    { connects: 5, amount: 5000 },
    { connects: 10, amount: 10000 },
    { connects: 50, amount: 40000 },
  ];
  const txns: Transaction[] = [];
  for (let i = 0; i < 25; i++) {
    const pack = randomFrom(connectPacks);
    const status: Transaction["status"] =
      i % 9 === 0 ? "failed" : i % 7 === 0 ? "pending" : "success";
    txns.push({
      id: nextId("txn").toUpperCase(),
      userId: randomFrom(users).id,
      amount: pack.amount,
      connects: pack.connects,
      type: i % 3 === 0 ? "apple_iap" : "paystack",
      status,
      date: daysAgo(Math.floor(Math.random() * 60)),
    });
  }
  return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function seedReviews(users: AppUser[]): Review[] {
  const comments = [
    "Great experience! Very professional and helpful throughout the process.",
    "Good communication, property was as described. Would recommend.",
    "Average experience. Response time could be better.",
    "Excellent service from start to finish, five stars!",
    "The listing photos matched the actual property perfectly.",
  ];
  return comments.map((comment, i) => ({
    id: nextId("rev"),
    reviewerId: randomFrom(users).id,
    revieweeId: randomFrom(users).id,
    rating: [5, 4, 3, 5, 5][i],
    comment,
    date: daysAgo(700 + i * 3),
    status: "approved",
  }));
}

function seedReports(users: AppUser[], listings: Listing[]): Report[] {
  const reasons = ["Other", "Scam or Fraud", "Already Rented/Sold", "Fake or Misleading Content"];
  const reports: Report[] = [];
  listings.slice(0, 6).forEach((l, i) => {
    reports.push({
      id: nextId("rpt"),
      targetType: "listing",
      reportedListingId: l.id,
      reporterId: randomFrom(users).id,
      reason: randomFrom(reasons),
      date: daysAgo(i + 1),
      status: "pending",
      flagCount: 0,
    });
  });
  reports.push({
    id: nextId("rpt"),
    targetType: "user",
    reportedUserId: randomFrom(users).id,
    reporterId: randomFrom(users).id,
    reason: "Fake or Misleading Content",
    date: daysAgo(14),
    status: "resolved",
    flagCount: 1,
    messageToReporter: "Thank you for the report, we've reviewed the account.",
    messageToReported: "Please ensure your listings reflect accurate information.",
  });
  return reports;
}

function seedNotifications(): AppNotification[] {
  return [
    { id: nextId("ntf"), type: "new_user", title: "New user registered", message: "A new user just signed up.", date: daysAgo(0), read: false },
    { id: nextId("ntf"), type: "new_listing", title: "New listing posted", message: "A new property listing needs review.", date: daysAgo(0), read: false },
    { id: nextId("ntf"), type: "user_report", title: "New report filed", message: "A user has been reported.", date: daysAgo(1), read: true },
    { id: nextId("ntf"), type: "transaction", title: "Connect purchase", message: "A user purchased 10 connects.", date: daysAgo(2), read: true },
    { id: nextId("ntf"), type: "new_review", title: "New review submitted", message: "A new review was posted.", date: daysAgo(3), read: true },
  ];
}

function seedWaitlist(): WaitlistEntry[] {
  return Array.from({ length: 22 }).map((_, i) => ({
    id: nextId("wl"),
    name: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
    email: `waitlist${i}@gmail.com`,
    phone: `+234${8000000000 + i}`,
    date: daysAgo(Math.floor(Math.random() * 40)),
  }));
}

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

interface AdminState {
  users: AppUser[];
  verifications: Verification[];
  listings: Listing[];
  messages: MessageThread[];
  transactions: Transaction[];
  reviews: Review[];
  reports: Report[];
  notifications: AppNotification[];
  waitlist: WaitlistEntry[];
  adminProfile: AdminProfile;
  supportAgents: SupportAgent[];
  theme: "dark" | "light";

  // Users
  suspendUser: (id: string) => void;
  reinstateUser: (id: string) => void;
  deleteUser: (id: string) => void;

  // Verifications
  approveVerification: (id: string) => void;
  rejectVerification: (id: string, reason: string) => void;

  // Listings
  approveListing: (id: string) => void;
  rejectListing: (id: string, reason: string) => void;
  closeListing: (id: string) => void;
  reopenListing: (id: string) => void;
  deleteListing: (id: string) => void;

  // Messages
  sendMessage: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
  startThreadWithUser: (userId: string) => string;

  // Reviews
  flagReview: (id: string) => void;

  // Reports
  markReportReviewed: (id: string) => void;
  markReportResolved: (id: string) => void;
  flagReport: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Settings
  updateAdminProfile: (profile: Partial<AdminProfile>) => void;
  toggleTheme: () => void;

  // Customer support accounts
  addSupportAgent: (agent: { fullName: string; email: string }) => void;
  removeSupportAgent: (id: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => {
      const users = seedUsers();
      const listings = seedListings(users);
      return {
        users,
        verifications: seedVerifications(users),
        listings,
        messages: seedMessages(users),
        transactions: seedTransactions(users),
        reviews: seedReviews(users),
        reports: seedReports(users, listings),
        notifications: seedNotifications(),
        waitlist: seedWaitlist(),
        supportAgents: seedSupportAgents(),
        adminProfile: {
          fullName: "Admin User",
          email: "admin@spacebutton.net",
          phone: "+234 800 000 0000",
          role: "Super Admin",
          avatarColor: "#7c3aed",
        },
        theme: "dark",

        suspendUser: (id) =>
          set({ users: get().users.map((u) => (u.id === id ? { ...u, status: "suspended" } : u)) }),
        reinstateUser: (id) =>
          set({ users: get().users.map((u) => (u.id === id ? { ...u, status: "active" } : u)) }),
        deleteUser: (id) => set({ users: get().users.filter((u) => u.id !== id) }),

        approveVerification: (id) =>
          set({
            verifications: get().verifications.map((v) =>
              v.id === id ? { ...v, status: "verified" } : v
            ),
          }),
        rejectVerification: (id, reason) =>
          set({
            verifications: get().verifications.map((v) =>
              v.id === id ? { ...v, status: "not_verified", rejectionReason: reason } : v
            ),
          }),

        approveListing: (id) =>
          set({
            listings: get().listings.map((l) =>
              l.id === id ? { ...l, approval: "approved" } : l
            ),
          }),
        rejectListing: (id, reason) =>
          set({
            listings: get().listings.map((l) =>
              l.id === id ? { ...l, approval: "rejected", rejectionReason: reason } : l
            ),
          }),
        closeListing: (id) =>
          set({ listings: get().listings.map((l) => (l.id === id ? { ...l, status: "closed" } : l)) }),
        reopenListing: (id) =>
          set({ listings: get().listings.map((l) => (l.id === id ? { ...l, status: "active" } : l)) }),
        deleteListing: (id) => set({ listings: get().listings.filter((l) => l.id !== id) }),

        sendMessage: (threadId, text) =>
          set({
            messages: get().messages.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    lastMessage: text,
                    lastMessageDate: new Date().toISOString(),
                    messages: [
                      ...t.messages,
                      { id: nextId("m"), sender: "admin", text, date: new Date().toISOString() },
                    ],
                  }
                : t
            ),
          }),
        markThreadRead: (threadId) =>
          set({
            messages: get().messages.map((t) =>
              t.id === threadId ? { ...t, unreadCount: 0 } : t
            ),
          }),
        startThreadWithUser: (userId) => {
          const existing = get().messages.find((t) => t.userId === userId);
          if (existing) return existing.id;
          const newThread = {
            id: nextId("msg"),
            userId,
            lastMessage: "",
            lastMessageDate: new Date().toISOString(),
            unreadCount: 0,
            messages: [],
          };
          set({ messages: [newThread, ...get().messages] });
          return newThread.id;
        },

        flagReview: (id) =>
          set({
            reviews: get().reviews.map((r) => (r.id === id ? { ...r, status: "flagged" } : r)),
          }),

        markReportReviewed: (id) =>
          set({
            reports: get().reports.map((r) => (r.id === id ? { ...r, status: "reviewed" } : r)),
          }),
        markReportResolved: (id) =>
          set({
            reports: get().reports.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)),
          }),
        flagReport: (id) => {
          const report = get().reports.find((r) => r.id === id);
          if (!report) return;
          const newFlagCount = report.flagCount + 1;
          set({
            reports: get().reports.map((r) => (r.id === id ? { ...r, flagCount: newFlagCount } : r)),
          });
          // After 3 flags: suspend reported user, or close reported listing
          if (newFlagCount >= 3) {
            if (report.targetType === "user" && report.reportedUserId) {
              get().suspendUser(report.reportedUserId);
            } else if (report.targetType === "listing" && report.reportedListingId) {
              get().closeListing(report.reportedListingId);
            }
          }
        },

        markNotificationRead: (id) =>
          set({
            notifications: get().notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          }),
        markAllNotificationsRead: () =>
          set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

        updateAdminProfile: (profile) =>
          set({ adminProfile: { ...get().adminProfile, ...profile } }),
        toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),

        addSupportAgent: (agent) =>
          set({
            supportAgents: [
              {
                id: nextId("sup"),
                fullName: agent.fullName,
                email: agent.email,
                createdDate: new Date().toISOString(),
                avatarColor: randomFrom(AVATAR_COLORS),
              },
              ...get().supportAgents,
            ],
          }),
        removeSupportAgent: (id) =>
          set({ supportAgents: get().supportAgents.filter((a) => a.id !== id) }),
      };
    },
    { name: ADMIN_STORAGE_KEY }
  )
);

// ----------------------------------------------------------------------------
// Derived selectors — always compute from source arrays, never store counts.
// ----------------------------------------------------------------------------

export function getUserListingsCount(listings: Listing[], userId: string): number {
  return listings.filter((l) => l.ownerId === userId).length;
}

export function getUserOffenseCount(reports: Report[], userId: string): number {
  return reports.filter((r) => r.targetType === "user" && r.reportedUserId === userId).length;
}

export function getUserById(users: AppUser[], id: string): AppUser | undefined {
  return users.find((u) => u.id === id);
}

export function getReferralCount(users: AppUser[], referralCode: string): number {
  return users.filter((u) => u.referredBy === referralCode).length;
}

export function getListingById(listings: Listing[], id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}
