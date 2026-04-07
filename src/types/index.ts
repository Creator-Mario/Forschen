export type UserRole = 'USER' | 'ADMIN';

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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  moderatorNote?: string;
}

export interface ForschungsBeitrag {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  bibleReference?: string;
  wochenthemaId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Gebet {
  id: string;
  userId: string;
  authorName?: string;
  content: string;
  anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Video {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
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
  createdAt: string;
}
