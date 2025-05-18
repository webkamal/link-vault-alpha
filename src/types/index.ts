
export interface Link {
  id: string;
  title: string;
  url: string;
  votes: number;
  userId: string;
  username: string;
  createdAt: string;
  comments: Comment[];
  tags: string[];
}

export interface Comment {
  id: string;
  linkId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export type SortOption = "votes" | "newest";

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

// Auth states for the application
export type AuthState = 'SIGNED_OUT' | 'SIGNED_IN' | 'LOADING';

// Profile update data
export interface ProfileUpdateData {
  username?: string;
  avatar_url?: string;
}
