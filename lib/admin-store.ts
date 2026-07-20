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
import type {
  AdminUser,
  AdminListing,
  PendingVerification,
  AdminUserReport,
  AdminListingReport,
} from "@/lib/api/admin";
import { adminApi } from "@/lib/api/admin";

export const ADMIN_STORAGE_KEY = "spacebutton-admin-storage-v4";

// ----------------------------------------------------------------------------
// Helpers for seed data (used for data that has no API endpoint)
// ----------------------------------------------------------------------------

const AVATAR_COLORS = [
  "#7c3aed", "#a855f7", "#8b5cf6", "#6366f1", "#c026d3", "#9333ea",
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

function avatarColorForId(id: string): string {
  const code = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

// ----------------------------------------------------------------------------
// API → Store mappers
// ----------------------------------------------------------------------------

function mapApiUser(u: AdminUser): AppUser {
  const statusRaw = (u.status ?? "active").toLowerCase();
  const status: AppUser["status"] =
    statusRaw === "suspended" ? "suspended"
    : statusRaw === "inactive" ? "inactive"
    : "active";
  return {
    id: u.id,
    userId: u.id.slice(-8).toUpperCase(),
    name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email,
    email: u.email,
    phone: u.phone_number ?? "",
    role: u.role === "agent" ? "agent" : "individual",
    status,
    joinDate: u.created_at,
    avatarColor: avatarColorForId(u.id),
    referralCode: "",
    connects: 0,
  };
}

function mapApiListing(l: AdminListing): Listing {
  const apiStatus = (l.status ?? "pending").toLowerCase();
  let approval: Listing["approval"] = "approved";
  let listingStatus: Listing["status"] = "active";

  if (apiStatus === "pending") {
    approval = "pending";
    listingStatus = "inactive";
  } else if (apiStatus === "rejected") {
    approval = "rejected";
    listingStatus = "inactive";
  } else if (apiStatus === "inactive" || apiStatus === "closed") {
    approval = "approved";
    listingStatus = apiStatus === "closed" ? "closed" : "inactive";
  } else {
    approval = "approved";
    listingStatus = "active";
  }

  const priceStr = (l.price ?? l.total_package ?? "0").toString().replace(/[^0-9.]/g, "");
  const price = parseFloat(priceStr) || 0;

  return {
    id: l.id,
    title: l.title ?? "Untitled Listing",
    ownerId: l.agent_id ?? "",
    location: [l.address, l.city, l.state].filter(Boolean).join(", ") || "Nigeria",
    price,
    type: "agent",
    status: listingStatus,
    approval,
    createdDate: l.created_at,
    images: l.images?.map((img) => img.url) ?? [],
    bedrooms: l.bedrooms ?? 0,
    bathrooms: l.bathrooms ?? 0,
    sittingRooms: 0,
    balconies: 0,
    category: l.property_type ?? "",
    description: l.description ?? "",
    conversationsCount: 0,
    flagCount: 0,
  };
}

function mapPendingVerification(v: PendingVerification): Verification {
  const idStatus = (v.id_verification_status ?? "pending").toLowerCase();
  const status: Verification["status"] =
    idStatus === "approved" ? "verified"
    : idStatus === "rejected" ? "not_verified"
    : "pending";
  return {
    id: v.user_id,
    userId: v.user_id,
    idType: (v.id_type ?? "ID") as Verification["idType"],
    idNumber: v.id_document_number ?? "",
    idImageUrl: v.id_document_url ?? "",
    selfieImageUrl: v.selfie_url ?? "",
    status,
    submittedDate: v.created_at ?? new Date().toISOString(),
  };
}

function mapUserReport(r: AdminUserReport): Report {
  const status: Report["status"] =
    r.status === "actioned" ? "resolved"
    : r.status === "dismissed" ? "dismissed"
    : "pending";
  return {
    id: r.id,
    targetType: "user",
    reportedUserId: r.reported_user_id,
    reporterId: r.reporter_id,
    reason: r.reason,
    details: r.details,
    date: r.created_at,
    status,
    flagCount: 0,
  };
}

function mapListingReport(r: AdminListingReport): Report {
  const status: Report["status"] =
    r.status === "actioned" ? "resolved"
    : r.status === "dismissed" ? "dismissed"
    : "pending";
  return {
    id: r.id,
    targetType: "listing",
    reportedListingId: r.listing_id,
    reporterId: r.reporter_id,
    reason: r.reason,
    details: r.details,
    date: r.created_at,
    status,
    flagCount: 0,
  };
}

// Fetch all pages of a paginated endpoint
async function fetchAllPages<T>(
  fetcher: (page: number, pageSize: number) => Promise<{ total?: number; [key: string]: unknown }>,
  itemsKey: string,
  pageSize = 100,
): Promise<T[]> {
  const first = await fetcher(1, pageSize);
  const items: T[] = (first[itemsKey] as T[]) ?? [];
  const total = (first.total as number) ?? 0;
  const pages = Math.ceil(total / pageSize);
  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => fetcher(i + 2, pageSize)),
    );
    for (const page of rest) items.push(...((page[itemsKey] as T[]) ?? []));
  }
  return items;
}

// ----------------------------------------------------------------------------
// Seed data for sections without API (messages, transactions, reviews, etc.)
// ----------------------------------------------------------------------------

function seedMessages(): MessageThread[] {
  return [];
}

function seedTransactions(): Transaction[] {
  return [];
}

function seedReviews(): Review[] {
  return [];
}

function seedNotifications(): AppNotification[] {
  return [
    { id: nextId("ntf"), type: "new_user", title: "New user registered", message: "A new user just signed up.", date: daysAgo(0), read: false },
    { id: nextId("ntf"), type: "new_listing", title: "New listing posted", message: "A new property listing needs review.", date: daysAgo(1), read: false },
  ];
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

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

interface AdminState {
  isLoading: boolean;
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

  // Data init
  initFromApi: () => Promise<void>;

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
    (set, get) => ({
      isLoading: false,
      users: [],
      verifications: [],
      listings: [],
      messages: seedMessages(),
      transactions: seedTransactions(),
      reviews: seedReviews(),
      reports: [],
      notifications: seedNotifications(),
      waitlist: [],
      supportAgents: seedSupportAgents(),
      adminProfile: {
        fullName: "Admin User",
        email: "admin@spacebutton.net",
        phone: "+234 800 000 0000",
        role: "Super Admin",
        avatarColor: "#7c3aed",
      },
      theme: "dark",

      // ── API init ─────────────────────────────────────────────────────────────
      initFromApi: async () => {
        set({ isLoading: true });
        try {
          const [apiUsers, apiListings, apiVerifications, userReports, listingReports, waitlistResp] =
            await Promise.allSettled([
              fetchAllPages<AdminUser>(
                (page, pageSize) => adminApi.getUsers(page, pageSize).then((r) => ({ total: r.total, users: r.users })),
                "users",
              ),
              fetchAllPages<AdminListing>(
                (page, pageSize) => adminApi.getListings(page, pageSize).then((r) => ({ total: r.total, listings: r.listings })),
                "listings",
              ),
              adminApi.getPendingVerifications(),
              fetchAllPages<AdminUserReport>(
                (page, pageSize) => adminApi.getUserReports(page, pageSize).then((r) => ({ total: r.total, reports: r.reports })),
                "reports",
              ),
              fetchAllPages<AdminListingReport>(
                (page, pageSize) => adminApi.getListingReports(page, pageSize).then((r) => ({ total: r.total, reports: r.reports })),
                "reports",
              ),
              adminApi.getWaitlist(1, 200),
            ]);

          const users =
            apiUsers.status === "fulfilled"
              ? apiUsers.value.map(mapApiUser)
              : get().users;

          const listings =
            apiListings.status === "fulfilled"
              ? apiListings.value.map(mapApiListing)
              : get().listings;

          const verifications =
            apiVerifications.status === "fulfilled"
              ? apiVerifications.value.map(mapPendingVerification)
              : get().verifications;

          const uReports =
            userReports.status === "fulfilled"
              ? userReports.value.map(mapUserReport)
              : [];
          const lReports =
            listingReports.status === "fulfilled"
              ? listingReports.value.map(mapListingReport)
              : [];
          const reports = [...uReports, ...lReports].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

          const waitlist: WaitlistEntry[] =
            waitlistResp.status === "fulfilled"
              ? (waitlistResp.value.entries ?? []).map((e) => ({
                  id: e.id,
                  name: e.email.split("@")[0],
                  email: e.email,
                  phone: "",
                  date: e.created_at,
                }))
              : get().waitlist;

          set({ users, listings, verifications, reports, waitlist });
        } catch {
          // silently keep whatever data is already in store
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Users ─────────────────────────────────────────────────────────────────
      suspendUser: async (id) => {
        try {
          await adminApi.suspendUser(id);
        } catch {
          return;
        }
        set({ users: get().users.map((u) => (u.id === id ? { ...u, status: "suspended" } : u)) });
      },
      reinstateUser: async (id) => {
        try {
          await adminApi.activateUser(id);
        } catch {
          return;
        }
        set({ users: get().users.map((u) => (u.id === id ? { ...u, status: "active" } : u)) });
      },
      deleteUser: (id) => set({ users: get().users.filter((u) => u.id !== id) }),

      // ── Verifications ─────────────────────────────────────────────────────────
      approveVerification: async (id) => {
        try {
          await adminApi.approveIdVerification(id);
        } catch {
          return;
        }
        set({
          verifications: get().verifications.map((v) =>
            v.id === id ? { ...v, status: "verified" } : v,
          ),
        });
      },
      rejectVerification: async (id, reason) => {
        try {
          await adminApi.rejectIdVerification(id, reason);
        } catch {
          return;
        }
        set({
          verifications: get().verifications.map((v) =>
            v.id === id ? { ...v, status: "not_verified", rejectionReason: reason } : v,
          ),
        });
      },

      // ── Listings ──────────────────────────────────────────────────────────────
      approveListing: async (id) => {
        try {
          await adminApi.approveListing(id);
        } catch {
          return;
        }
        set({
          listings: get().listings.map((l) =>
            l.id === id ? { ...l, approval: "approved", status: "active" } : l,
          ),
        });
      },
      rejectListing: async (id, reason) => {
        try {
          await adminApi.rejectListing(id, reason);
        } catch {
          return;
        }
        set({
          listings: get().listings.map((l) =>
            l.id === id ? { ...l, approval: "rejected", rejectionReason: reason } : l,
          ),
        });
      },
      closeListing: (id) =>
        set({ listings: get().listings.map((l) => (l.id === id ? { ...l, status: "closed" } : l)) }),
      reopenListing: (id) =>
        set({ listings: get().listings.map((l) => (l.id === id ? { ...l, status: "active" } : l)) }),
      deleteListing: async (id) => {
        try {
          await adminApi.deleteListing(id);
        } catch {
          return;
        }
        set({ listings: get().listings.filter((l) => l.id !== id) });
      },

      // ── Messages ──────────────────────────────────────────────────────────────
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
              : t,
          ),
        }),
      markThreadRead: (threadId) =>
        set({
          messages: get().messages.map((t) =>
            t.id === threadId ? { ...t, unreadCount: 0 } : t,
          ),
        }),
      startThreadWithUser: (userId) => {
        const existing = get().messages.find((t) => t.userId === userId);
        if (existing) return existing.id;
        const newThread: MessageThread = {
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

      // ── Reviews ───────────────────────────────────────────────────────────────
      flagReview: (id) =>
        set({
          reviews: get().reviews.map((r) => (r.id === id ? { ...r, status: "flagged" } : r)),
        }),

      // ── Reports ───────────────────────────────────────────────────────────────
      markReportReviewed: (id) =>
        set({
          reports: get().reports.map((r) => (r.id === id ? { ...r, status: "reviewed" } : r)),
        }),
      markReportResolved: async (id) => {
        const report = get().reports.find((r) => r.id === id);
        try {
          if (report?.targetType === "user") {
            await adminApi.updateUserReport(id, "actioned");
          } else if (report?.targetType === "listing") {
            await adminApi.updateListingReport(id, "actioned");
          }
        } catch {
          return;
        }
        set({
          reports: get().reports.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)),
        });
      },
      flagReport: (id) => {
        const report = get().reports.find((r) => r.id === id);
        if (!report) return;
        const newFlagCount = report.flagCount + 1;
        set({
          reports: get().reports.map((r) => (r.id === id ? { ...r, flagCount: newFlagCount } : r)),
        });
        if (newFlagCount >= 3) {
          if (report.targetType === "user" && report.reportedUserId) {
            get().suspendUser(report.reportedUserId);
          } else if (report.targetType === "listing" && report.reportedListingId) {
            get().closeListing(report.reportedListingId);
          }
        }
      },

      // ── Notifications ─────────────────────────────────────────────────────────
      markNotificationRead: (id) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }),
      markAllNotificationsRead: () =>
        set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

      // ── Settings ──────────────────────────────────────────────────────────────
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
    }),
    {
      name: ADMIN_STORAGE_KEY,
      // Only persist theme and adminProfile — data is always freshly fetched from API
      partialize: (state) => ({
        theme: state.theme,
        adminProfile: state.adminProfile,
      }),
    },
  ),
);

// ----------------------------------------------------------------------------
// Derived selectors
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
