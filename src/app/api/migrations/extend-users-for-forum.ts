import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function extendUsersForForum() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Extending users table for forum...');

    // Check and add avatar_url column
    const avatarUrlCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'avatar_url'
      )
    `);

    if (!avatarUrlCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)`);
      console.log('Added avatar_url column to users table');
    }

    // Check and add bio column
    const bioCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'bio'
      )
    `);

    if (!bioCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN bio TEXT`);
      console.log('Added bio column to users table');
    }

    // Check and add location column
    const locationCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'location'
      )
    `);

    if (!locationCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN location VARCHAR(255)`);
      console.log('Added location column to users table');
    }

    // Check and add social_links column
    const socialLinksCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'social_links'
      )
    `);

    if (!socialLinksCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb`);
      console.log('Added social_links column to users table');
    }

    // Check and add last_active column
    const lastActiveCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'last_active'
      )
    `);

    if (!lastActiveCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);
      await client.query(`CREATE INDEX idx_users_last_active ON users(last_active DESC)`);
      console.log('Added last_active column to users table');
    }

    // Check and add forum_reputation column
    const reputationCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'forum_reputation'
      )
    `);

    if (!reputationCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN forum_reputation INTEGER DEFAULT 0`);
      await client.query(`CREATE INDEX idx_users_forum_reputation ON users(forum_reputation DESC)`);
      console.log('Added forum_reputation column to users table');
    }

    // Check and add forum_post_count column
    const postCountCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'forum_post_count'
      )
    `);

    if (!postCountCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN forum_post_count INTEGER DEFAULT 0`);
      console.log('Added forum_post_count column to users table');
    }

    // Check and add is_banned column
    const isBannedCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_banned'
      )
    `);

    if (!isBannedCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE`);
      await client.query(`CREATE INDEX idx_users_is_banned ON users(is_banned)`);
      console.log('Added is_banned column to users table');
    }

    // Check and add ban_expires_at column
    const banExpiresCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'ban_expires_at'
      )
    `);

    if (!banExpiresCheck.rows[0].exists) {
      await client.query(`ALTER TABLE users ADD COLUMN ban_expires_at TIMESTAMP WITH TIME ZONE`);
      console.log('Added ban_expires_at column to users table');
    }

    // Check if forum_posts table exists before creating triggers
    const forumPostsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_posts'
      )
    `);

    if (forumPostsCheck.rows[0].exists) {
      // Create trigger to update user forum_post_count when they create a post
      await client.query(`
        CREATE OR REPLACE FUNCTION update_user_forum_post_count()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE users
            SET forum_post_count = forum_post_count + 1
            WHERE id = NEW.user_id;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      const triggerCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_trigger 
          WHERE tgname = 'trigger_update_user_forum_post_count'
        )
      `);

      if (!triggerCheck.rows[0].exists) {
        await client.query(`
          CREATE TRIGGER trigger_update_user_forum_post_count
              AFTER INSERT ON forum_posts
              FOR EACH ROW
              EXECUTE FUNCTION update_user_forum_post_count();
        `);
        console.log('Created trigger to update user forum_post_count');
      }

      // Create trigger to decrement user forum_post_count when a post is deleted
      await client.query(`
        CREATE OR REPLACE FUNCTION update_user_forum_post_count_delete()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE users
            SET forum_post_count = GREATEST(0, forum_post_count - 1)
            WHERE id = OLD.user_id;
            RETURN OLD;
        END;
        $$ language 'plpgsql';
      `);

      const deleteTriggerCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_trigger 
          WHERE tgname = 'trigger_update_user_forum_post_count_delete'
        )
      `);

      if (!deleteTriggerCheck.rows[0].exists) {
        await client.query(`
          CREATE TRIGGER trigger_update_user_forum_post_count_delete
              AFTER DELETE ON forum_posts
              FOR EACH ROW
              EXECUTE FUNCTION update_user_forum_post_count_delete();
        `);
        console.log('Created trigger to decrement user forum_post_count on delete');
      }
    } else {
      console.log('forum_posts table does not exist yet. Skipping trigger creation. Please run createForumTables first.');
    }

    await client.query('COMMIT');
    console.log('Users table extended for forum successfully');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error extending users table for forum:', error);
    throw error;
  } finally {
    client.release();
  }
}

