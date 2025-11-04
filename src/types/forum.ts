export interface ForumCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  display_order: number;
  permissions: {
    view: 'all' | 'registered' | 'moderator';
    post: 'all' | 'registered' | 'moderator';
    reply: 'all' | 'registered' | 'moderator';
  };
  created_at: string;
  updated_at: string;
  thread_count?: number;
  post_count?: number;
  last_activity?: string;
}

export interface ForumThread {
  id: number;
  category_id: number;
  user_id: number;
  title: string;
  slug: string;
  created_at: string;
  last_post_at: string;
  views: number;
  post_count: number;
  is_locked: boolean;
  is_sticky: boolean;
  is_solved: boolean;
  solved_post_id: number | null;
  updated_at: string;
  category?: ForumCategory;
  author?: ForumUser;
  last_post_author?: ForumUser;
  is_subscribed?: boolean;
  is_bookmarked?: boolean;
}

export interface ForumPost {
  id: number;
  thread_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  edited_at: string | null;
  author?: ForumUser;
  thread?: ForumThread;
  like_count?: number;
  is_liked?: boolean;
}

export interface ForumUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  social_links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  } | null;
  last_active: string | null;
  forum_reputation: number;
  forum_post_count: number;
  created_at: string;
  updated_at: string;
  is_banned: boolean;
  ban_expires_at: string | null;
}

export interface ForumLike {
  id: number;
  post_id: number;
  user_id: number;
  created_at: string;
}

export interface ForumMention {
  id: number;
  post_id: number;
  mentioned_user_id: number;
  created_at: string;
}

export interface ForumNotification {
  id: number;
  user_id: number;
  type: 'reply' | 'mention' | 'like' | 'quote' | 'moderation';
  reference_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ForumSubscription {
  id: number;
  user_id: number;
  thread_id: number;
  created_at: string;
}

export interface ForumBookmark {
  id: number;
  user_id: number;
  thread_id: number;
  created_at: string;
}

export interface ForumReport {
  id: number;
  post_id: number;
  user_id: number;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at: string | null;
  resolved_by: number | null;
}

export interface ForumRole {
  id: number;
  name: string;
  permissions: {
    can_moderate?: boolean;
    can_delete_posts?: boolean;
    can_lock_threads?: boolean;
    can_sticky_threads?: boolean;
    can_ban_users?: boolean;
    can_edit_categories?: boolean;
  };
  created_at: string;
}

export interface UserForumRole {
  id: number;
  user_id: number;
  role_id: number;
  assigned_at: string;
  assigned_by: number | null;
}

