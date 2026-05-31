
export type Language = 'en' | 'ru' | 'uz';
export type AIModelType = 'teacher' | 'coach' | 'trainer';

export interface Attachment {
  mimeType: string;
  data: string; // base64
  name: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachment?: Attachment;
}

export interface UserProfile {
  email: string;
  name: string;
  photo?: string;
  bio?: string;
  interests: string[];
  language: Language;
  xp: number;
  level: number;
  isAdmin: boolean;
  password?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  type: AIModelType;
  messages: Message[];
  lastUpdated: number;
}

export interface Review {
  id: string;
  userName: string;
  text: string;
  rating: number;
  timestamp: number;
}

export interface Article {
  id: string;
  subject: 'Physics' | 'Algebra' | 'English';
  title: string;
  content: string;
  author: string;
  icon: string;
}

// Added Node interface to support mind map components and fix the import error in NodeItem.tsx
export interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  isGenerating?: boolean;
}
