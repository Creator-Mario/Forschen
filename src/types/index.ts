export type UserRole = 'USER' | 'ADMIN';

// User account lifecycle status
export type UserStatus =
  | 'pending_email'        // registered, awaiting email confirmation
  | 'email_verified'       // email confirmed, must fill intro form
  | 'awaiting_admin_review' // intro submitted, awaiting admin approval
  | 'question_to_user'     // admin sent a question back
  | 'postponed'            // admin postponed decision
  | 'active'               // fully approved, may log in
  | 'deleted';             // legacy deactivated/locked state; account record still exists

// New canonical status values; legacy 'pending' | 'approved' | 'rejected' kept for backward compat.
export type ContentStatus =
  | 'created'
  | 'review'
  | 'published'
  | 'question_to_user'
  | 'postponed'
  | 'deleted'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface UserIntro {
  motivation: string;   // "Warum möchtest du mitmachen?"
  vorstellung: string;  // "Stelle dich den Mitgliedern vor"
  submittedAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  profileImage?: string;
  profileImageUpdatedAt?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  active: boolean;         // kept for backward-compat; derived from status === 'active'
  emailToken?: string;     // one-time token for email verification
  emailVerifiedAt?: string;
  passwordResetToken?: string;   // one-time token for self-service password reset
  passwordResetExpiry?: string;  // ISO timestamp – token expires after this
  intro?: UserIntro;       // mandatory intro/motivation form
  adminNote?: string;      // admin's internal note or question
  weeklyFaithEmailEnabled?: boolean;
  weeklyFaithEmailUpdatedAt?: string;
  lastWeeklyFaithEmailWeek?: string;
}

export interface ChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface CommunityAnswer {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityQuestion {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  answers: CommunityAnswer[];
}

export interface Tageswort {
  id: string;
  date: string;
  verse: string;
  text: string;
  context: string;
  questions: string[];
  published?: boolean;
}

export interface Wochenthema {
  id: string;
  week: string;
  title: string;
  introduction: string;
  bibleVerses: string[];
  problemStatement: string;
  researchQuestions: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt?: string;
}

export interface PsalmThema {
  id: string;
  date: string;
  psalmReference: string;
  title: string;
  excerpt: string;
  summary: string;
  significance: string;
  practice: string;
  questions: string[];
}

export interface GlaubenHeuteThema {
  id: string;
  date: string;
  title: string;
  headline: string;
  worldFocus: string;
  faithPerspective: string;
  discipleshipImpulse: string;
  bibleVerses: string[];
  questions: string[];
}

export interface Buchempfehlung {
  title: string;
  author: string;
  description: string;
  relevance: string;
}

export interface BuchempfehlungsSammlung {
  id: string;
  date: string;
  topicTitle: string;
  introduction: string;
  recommendations: Buchempfehlung[];
}

export interface NutzerBuchempfehlung {
  id: string;
  userId: string;
  recommenderName: string;
  title: string;
  author: string;
  description: string;
  themeReference: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  adminMessage?: string;
}

export interface These {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  bibleReference?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  moderatorNote?: string;
  adminMessage?: string;
}

export interface ForschungsBeitrag {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  bibleReference?: string;
  wochenthemaId?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  adminMessage?: string;
}

export interface Gebet {
  id: string;
  userId: string;
  authorName?: string;
  content: string;
  anonymous: boolean;
  status: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  adminMessage?: string;
}

export interface Video {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  wochenthemaId?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  adminMessage?: string;
}

export interface Aktion {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  description: string;
  location?: string;
  dateEvent?: string;
  contactInfo?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt?: string;
  adminMessage?: string;
}

export interface SpendenRecord {
  id: string;
  amount: number;
  currency: string;
  message?: string;
  anonymous: boolean;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  note?: string;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  contentType: string;
  contentTypeLabel: string;
  title: string;
  status: string;
  adminMessage: string;
  createdAt: string;
}
