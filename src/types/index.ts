export type UserRole = 'USER' | 'ADMIN';

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

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
  active: boolean;
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
  status: ContentStatus;
  createdAt: string;
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
