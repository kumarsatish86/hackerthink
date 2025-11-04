import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export interface UserPermissions {
  canView: boolean;
  canPost: boolean;
  canReply: boolean;
  canModerate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export async function getForumPermissions(
  userId: number | null,
  categoryId?: number,
  threadUserId?: number
): Promise<UserPermissions> {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === 'admin';
  const currentUserId = session?.user?.id ? parseInt(session.user.id as string) : null;

  // Check if user is banned
  if (currentUserId) {
    const userCheck = await pool.query(
      'SELECT is_banned, ban_expires_at FROM users WHERE id = $1',
      [currentUserId]
    );
    
    if (userCheck.rows.length > 0) {
      const user = userCheck.rows[0];
      if (user.is_banned) {
        const banExpires = user.ban_expires_at ? new Date(user.ban_expires_at) : null;
        if (!banExpires || banExpires > new Date()) {
          // User is banned
          return {
            canView: true, // Can still view
            canPost: false,
            canReply: false,
            canModerate: false,
            canEdit: false,
            canDelete: false,
          };
        }
      }
    }
  }

  // Admins have full permissions
  if (isAdmin) {
    return {
      canView: true,
      canPost: true,
      canReply: true,
      canModerate: true,
      canEdit: true,
      canDelete: true,
    };
  }

  // Get category permissions if categoryId is provided
  if (categoryId) {
    const categoryResult = await pool.query(
      'SELECT permissions FROM forum_categories WHERE id = $1',
      [categoryId]
    );

    if (categoryResult.rows.length > 0) {
      const permissions = categoryResult.rows[0].permissions || {
        view: 'all',
        post: 'registered',
        reply: 'registered',
      };

      const canView = permissions.view === 'all' || (permissions.view === 'registered' && isAuthenticated);
      const canPost = isAuthenticated && (permissions.post === 'all' || permissions.post === 'registered');
      const canReply = isAuthenticated && (permissions.reply === 'all' || permissions.reply === 'registered');

      return {
        canView,
        canPost,
        canReply,
        canModerate: false,
        canEdit: threadUserId === currentUserId,
        canDelete: false,
      };
    }
  }

  // Default permissions for guests
  if (!isAuthenticated) {
    return {
      canView: true,
      canPost: false,
      canReply: false,
      canModerate: false,
      canEdit: false,
      canDelete: false,
    };
  }

  // Default permissions for authenticated users
  return {
    canView: true,
    canPost: true,
    canReply: true,
    canModerate: false,
    canEdit: threadUserId === currentUserId,
    canDelete: false,
  };
}

export async function requireAuth(): Promise<{ id: number | string; role: string }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Support both UUID and integer user IDs
  const userId = session.user.id;
  if (!userId) {
    throw new Error('Invalid user ID');
  }

  // Try to parse as integer, but keep as string if it's a UUID
  const userIdNumber = typeof userId === 'string' && /^\d+$/.test(userId) 
    ? parseInt(userId) 
    : userId;

  return {
    id: userIdNumber,
    role: session.user.role || 'user',
  };
}

export async function requireAdmin(): Promise<{ id: number | string; role: string }> {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

export async function requireModerator(): Promise<{ id: number | string; role: string }> {
  const user = await requireAuth();
  const session = await getServerSession(authOptions);
  
  // Admins are always moderators
  if (user.role === 'admin') {
    return user;
  }
  
  // Check if user_forum_roles table exists
  const tableCheck = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_forum_roles'
    )
  `);
  
  if (!tableCheck.rows[0].exists) {
    // If tables don't exist yet, only admins can access
    throw new Error('Forbidden: Moderator access required');
  }
  
  // Check if user has moderator role in forum_roles
  try {
    const roleCheck = await pool.query(
      `SELECT fr.* FROM user_forum_roles ufr
       JOIN forum_roles fr ON ufr.role_id = fr.id
       WHERE ufr.user_id = $1 AND fr.permissions->>'can_moderate' = 'true'`,
      [user.id]
    );

    if (roleCheck.rows.length === 0) {
      throw new Error('Forbidden: Moderator access required');
    }
  } catch (error: any) {
    // If query fails (e.g., table doesn't exist or column mismatch), only admins can access
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      throw new Error('Forbidden: Moderator access required');
    }
    throw error;
  }

  return user;
}

export async function isUserBanned(userId: number): Promise<boolean> {
  const result = await pool.query(
    'SELECT is_banned, ban_expires_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const user = result.rows[0];
  if (!user.is_banned) {
    return false;
  }

  const banExpires = user.ban_expires_at ? new Date(user.ban_expires_at) : null;
  if (!banExpires) {
    // Permanent ban
    return true;
  }

  return banExpires > new Date();
}

