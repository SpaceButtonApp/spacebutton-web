// ============================================================================
// SpaceButton Admin — Core Types
// ============================================================================

export type UserRole = "individual" | "agent";
export type UserStatus = "active" | "pending_verification" | "suspended";
export type IdType = "NIN" | "Drivers License" | "Voter's Card" | "Passport";
export type VerificationStatus = "verified" | "not_verified" | "pending";
export type ListingStatus = "active" | "closed";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ListingType = "agent" | "connect";
export type TransactionType = "paystack" | "apple_iap";
export type TransactionStatus = "success" | "pending" | "failed";
export type ReviewStatus = "approved" | "flagged";
export type ReportStatus = "pending" | "reviewed" | "resolved";
export type ReportTargetType = "user" | "listing";
export type NotificationType =
  | "new_listing"
  | "new_review"
  | "user_report"
  | "transaction"
  | "new_user"
  | "verification";

export interface AppUser {
  id: string; // internal id (uuid-ish)
  userId: string; // display User ID (short)
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string; // ISO
  avatarColor: string;
  referralCode: string;
  referredBy?: string; // referralCode of the user who referred this one
  referralsMade: number;
  connects: number; // available connects balance
  bio?: string;
}

export interface Verification {
  id: string;
  userId: string; // AppUser.id
  idType: IdType;
  idNumber: string;
  idImageUrl: string;
  selfieImageUrl: string;
  status: VerificationStatus;
  submittedDate: string;
  rejectionReason?: string;
}

export interface Listing {
  id: string;
  title: string;
  ownerId: string; // AppUser.id
  location: string;
  price: number;
  type: ListingType;
  status: ListingStatus;
  approval: ApprovalStatus;
  createdDate: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  sittingRooms: number;
  balconies: number;
  category: string;
  description: string;
  conversationsCount: number;
  flagCount: number;
  rejectionReason?: string;
}

export interface MessageThread {
  id: string;
  userId: string; // AppUser.id the admin is chatting with
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  messages: { id: string; sender: "admin" | "user"; text: string; date: string }[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  connects: number;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string; // agent/individual being reviewed
  listingId?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  status: ReviewStatus;
}

export interface Report {
  id: string;
  targetType: ReportTargetType;
  reportedUserId?: string;
  reportedListingId?: string;
  reporterId: string;
  reason: string;
  details?: string;
  date: string;
  status: ReportStatus;
  flagCount: number;
  messageToReporter?: string;
  messageToReported?: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
}

export interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatarColor: string;
  avatarUrl?: string;
}

export interface SupportAgent {
  id: string;
  fullName: string;
  email: string;
  createdDate: string;
  avatarColor: string;
}
