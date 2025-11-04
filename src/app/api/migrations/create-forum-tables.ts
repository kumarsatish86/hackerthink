import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function createForumTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Creating forum tables...');

    // 1. Create forum_categories table
    const categoriesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_categories'
      )
    `);

    if (!categoriesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          parent_id INTEGER REFERENCES forum_categories(id) ON DELETE SET NULL,
          display_order INTEGER NOT NULL DEFAULT 0,
          permissions JSONB DEFAULT '{"view": "all", "post": "registered", "reply": "registered"}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_forum_categories_slug ON forum_categories(slug)`);
      await client.query(`CREATE INDEX idx_forum_categories_parent_id ON forum_categories(parent_id)`);
      await client.query(`CREATE INDEX idx_forum_categories_display_order ON forum_categories(display_order)`);
      console.log('Created forum_categories table');
    }

    // Check if users table exists
    const usersTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);

    if (!usersTableCheck.rows[0].exists) {
      throw new Error('Users table does not exist. Please create the users table first.');
    }

    // Check users table id column type
    const usersIdTypeCheck = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'id'
    `);

    if (usersIdTypeCheck.rows.length === 0) {
      throw new Error('Users table does not have an id column.');
    }

    const usersIdType = usersIdTypeCheck.rows[0].data_type;
    // Support both UUID and INTEGER/BIGINT for user IDs
    const userIdColumnType = usersIdType === 'uuid' ? 'UUID' : 'INTEGER';
    console.log(`Detected users.id type: ${usersIdType}, using ${userIdColumnType} for forum user_id columns`);

    // 2. Create forum_threads table (solved_post_id FK will be added after posts table)
    const threadsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_threads'
      )
    `);

    if (!threadsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_threads (
          id SERIAL PRIMARY KEY,
          category_id INTEGER NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
          user_id ${userIdColumnType} NOT NULL,
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(500) NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_post_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          views INTEGER DEFAULT 0,
          post_count INTEGER DEFAULT 0,
          is_locked BOOLEAN DEFAULT FALSE,
          is_sticky BOOLEAN DEFAULT FALSE,
          is_solved BOOLEAN DEFAULT FALSE,
          solved_post_id INTEGER,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add foreign key constraint separately
      try {
        await client.query(`
          ALTER TABLE forum_threads
          ADD CONSTRAINT forum_threads_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for user_id:', fkError.message);
        // Continue without foreign key if it fails
      }
      await client.query(`CREATE INDEX idx_forum_threads_category_id ON forum_threads(category_id)`);
      await client.query(`CREATE INDEX idx_forum_threads_user_id ON forum_threads(user_id)`);
      await client.query(`CREATE INDEX idx_forum_threads_slug ON forum_threads(slug)`);
      await client.query(`CREATE INDEX idx_forum_threads_last_post_at ON forum_threads(last_post_at DESC)`);
      await client.query(`CREATE INDEX idx_forum_threads_created_at ON forum_threads(created_at DESC)`);
      await client.query(`CREATE INDEX idx_forum_threads_is_locked ON forum_threads(is_locked)`);
      await client.query(`CREATE INDEX idx_forum_threads_is_sticky ON forum_threads(is_sticky)`);
      await client.query(`CREATE INDEX idx_forum_threads_is_solved ON forum_threads(is_solved)`);
      await client.query(`CREATE INDEX idx_forum_threads_views ON forum_threads(views DESC)`);
      // Full-text search index for title
      await client.query(`CREATE INDEX idx_forum_threads_title_fts ON forum_threads USING gin(to_tsvector('english', title))`);
      console.log('Created forum_threads table');
    }

    // 3. Create forum_posts table
    const postsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_posts'
      )
    `);

    if (!postsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_posts (
          id SERIAL PRIMARY KEY,
          thread_id INTEGER NOT NULL,
          user_id ${userIdColumnType} NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_edited BOOLEAN DEFAULT FALSE,
          edited_at TIMESTAMP WITH TIME ZONE
        )
      `);
      
      // Add foreign key constraints separately
      try {
        await client.query(`
          ALTER TABLE forum_posts
          ADD CONSTRAINT forum_posts_thread_id_fkey
          FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for thread_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE forum_posts
          ADD CONSTRAINT forum_posts_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for user_id:', fkError.message);
      }
      await client.query(`CREATE INDEX idx_forum_posts_thread_id ON forum_posts(thread_id)`);
      await client.query(`CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id)`);
      await client.query(`CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at ASC)`);
      await client.query(`CREATE INDEX idx_forum_posts_updated_at ON forum_posts(updated_at DESC)`);
      // Full-text search index
      await client.query(`CREATE INDEX idx_forum_posts_content_fts ON forum_posts USING gin(to_tsvector('english', content))`);
      console.log('Created forum_posts table');
    }

    // Add foreign key constraint for solved_post_id after both tables exist
    const solvedPostFkCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_threads_solved_post_id_fkey'
        AND table_name = 'forum_threads'
      )
    `);

    if (!solvedPostFkCheck.rows[0].exists) {
      try {
        await client.query(`
          ALTER TABLE forum_threads
          ADD CONSTRAINT forum_threads_solved_post_id_fkey
          FOREIGN KEY (solved_post_id) REFERENCES forum_posts(id) ON DELETE SET NULL;
        `);
        console.log('Added solved_post_id foreign key constraint');
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for solved_post_id:', fkError.message);
      }
    }

    // 4. Create forum_likes table
    const likesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_likes'
      )
    `);

    if (!likesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_likes (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL,
          user_id ${userIdColumnType} NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(post_id, user_id)
        )
      `);
      await client.query(`CREATE INDEX idx_forum_likes_post_id ON forum_likes(post_id)`);
      await client.query(`CREATE INDEX idx_forum_likes_user_id ON forum_likes(user_id)`);
      
      // Add foreign key constraints separately
      try {
        await client.query(`
          ALTER TABLE forum_likes
          ADD CONSTRAINT forum_likes_post_id_fkey
          FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for post_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE forum_likes
          ADD CONSTRAINT forum_likes_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for user_id:', fkError.message);
      }
      
      console.log('Created forum_likes table');
    }

    // 5. Create forum_mentions table
    const mentionsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_mentions'
      )
    `);

    if (!mentionsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_mentions (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL,
          mentioned_user_id ${userIdColumnType} NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_forum_mentions_post_id ON forum_mentions(post_id)`);
      await client.query(`CREATE INDEX idx_forum_mentions_mentioned_user_id ON forum_mentions(mentioned_user_id)`);
      
      // Add foreign key constraints separately
      try {
        await client.query(`
          ALTER TABLE forum_mentions
          ADD CONSTRAINT forum_mentions_post_id_fkey
          FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for post_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE forum_mentions
          ADD CONSTRAINT forum_mentions_mentioned_user_id_fkey
          FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for mentioned_user_id:', fkError.message);
      }
      
      console.log('Created forum_mentions table');
    }

    // 6. Create forum_notifications table
    const notificationsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_notifications'
      )
    `);

    if (!notificationsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_notifications (
          id SERIAL PRIMARY KEY,
          user_id ${userIdColumnType} NOT NULL,
          type VARCHAR(50) NOT NULL,
          reference_id INTEGER,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_forum_notifications_user_id ON forum_notifications(user_id)`);
      await client.query(`CREATE INDEX idx_forum_notifications_is_read ON forum_notifications(is_read)`);
      await client.query(`CREATE INDEX idx_forum_notifications_created_at ON forum_notifications(created_at DESC)`);
      await client.query(`CREATE INDEX idx_forum_notifications_user_read ON forum_notifications(user_id, is_read)`);
      
      // Add foreign key constraint separately
      try {
        await client.query(`
          ALTER TABLE forum_notifications
          ADD CONSTRAINT forum_notifications_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for user_id:', fkError.message);
      }
      
      console.log('Created forum_notifications table');
    }

    // 7. Create forum_subscriptions table
    const subscriptionsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_subscriptions'
      )
    `);

    if (!subscriptionsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id ${userIdColumnType} NOT NULL,
          thread_id INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, thread_id)
        )
      `);
      await client.query(`CREATE INDEX idx_forum_subscriptions_user_id ON forum_subscriptions(user_id)`);
      await client.query(`CREATE INDEX idx_forum_subscriptions_thread_id ON forum_subscriptions(thread_id)`);
      
      // Add foreign key constraints separately
      try {
        await client.query(`
          ALTER TABLE forum_subscriptions
          ADD CONSTRAINT forum_subscriptions_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for user_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE forum_subscriptions
          ADD CONSTRAINT forum_subscriptions_thread_id_fkey
          FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for thread_id:', fkError.message);
      }
      
      console.log('Created forum_subscriptions table');
    }

    // 8. Create forum_bookmarks table
    const bookmarksCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_bookmarks'
      )
    `);

    if (!bookmarksCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_bookmarks (
          id SERIAL PRIMARY KEY,
          user_id ${userIdColumnType} NOT NULL,
          thread_id INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, thread_id)
        )
      `);
      await client.query(`CREATE INDEX idx_forum_bookmarks_user_id ON forum_bookmarks(user_id)`);
      await client.query(`CREATE INDEX idx_forum_bookmarks_thread_id ON forum_bookmarks(thread_id)`);
      
      // Add foreign key constraints separately
      try {
        await client.query(`
          ALTER TABLE forum_bookmarks
          ADD CONSTRAINT forum_bookmarks_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for user_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE forum_bookmarks
          ADD CONSTRAINT forum_bookmarks_thread_id_fkey
          FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for thread_id:', fkError.message);
      }
      
      console.log('Created forum_bookmarks table');
    }

    // 9. Create forum_reports table
    const reportsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_reports'
      )
    `);

    if (!reportsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_reports (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL,
          user_id ${userIdColumnType} NOT NULL,
          reason TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP WITH TIME ZONE,
          resolved_by ${userIdColumnType}
        )
      `);
      await client.query(`CREATE INDEX idx_forum_reports_post_id ON forum_reports(post_id)`);
      await client.query(`CREATE INDEX idx_forum_reports_user_id ON forum_reports(user_id)`);
      await client.query(`CREATE INDEX idx_forum_reports_status ON forum_reports(status)`);
      await client.query(`CREATE INDEX idx_forum_reports_created_at ON forum_reports(created_at DESC)`);
      
      // Add foreign key constraints separately
      try {
        await client.query(`
          ALTER TABLE forum_reports
          ADD CONSTRAINT forum_reports_post_id_fkey
          FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for post_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE forum_reports
          ADD CONSTRAINT forum_reports_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for user_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE forum_reports
          ADD CONSTRAINT forum_reports_resolved_by_fkey
          FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for resolved_by:', fkError.message);
      }
      
      console.log('Created forum_reports table');
    }

    // 10. Create forum_roles table
    const rolesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_roles'
      )
    `);

    if (!rolesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE forum_roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_forum_roles_name ON forum_roles(name)`);
      console.log('Created forum_roles table');
    }

    // 11. Create user_forum_roles table
    const userRolesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_forum_roles'
      )
    `);

    if (!userRolesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE user_forum_roles (
          id SERIAL PRIMARY KEY,
          user_id ${userIdColumnType} NOT NULL,
          role_id INTEGER NOT NULL,
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          assigned_by ${userIdColumnType},
          UNIQUE(user_id, role_id)
        )
      `);
      await client.query(`CREATE INDEX idx_user_forum_roles_user_id ON user_forum_roles(user_id)`);
      await client.query(`CREATE INDEX idx_user_forum_roles_role_id ON user_forum_roles(role_id)`);
      
      // Add foreign key constraints separately
      try {
        await client.query(`
          ALTER TABLE user_forum_roles
          ADD CONSTRAINT user_forum_roles_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for user_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE user_forum_roles
          ADD CONSTRAINT user_forum_roles_role_id_fkey
          FOREIGN KEY (role_id) REFERENCES forum_roles(id) ON DELETE CASCADE;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for role_id:', fkError.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE user_forum_roles
          ADD CONSTRAINT user_forum_roles_assigned_by_fkey
          FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;
        `);
      } catch (fkError: any) {
        console.warn('Could not add foreign key constraint for assigned_by:', fkError.message);
      }
      
      console.log('Created user_forum_roles table');
    }

    // Create or update the updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at columns
    await client.query(`
      DROP TRIGGER IF EXISTS update_forum_categories_updated_at ON forum_categories;
      CREATE TRIGGER update_forum_categories_updated_at
          BEFORE UPDATE ON forum_categories
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_forum_threads_updated_at ON forum_threads;
      CREATE TRIGGER update_forum_threads_updated_at
          BEFORE UPDATE ON forum_threads
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
      CREATE TRIGGER update_forum_posts_updated_at
          BEFORE UPDATE ON forum_posts
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create trigger to update thread post_count and last_post_at when a post is added
    await client.query(`
      CREATE OR REPLACE FUNCTION update_thread_on_post()
      RETURNS TRIGGER AS $$
      BEGIN
          UPDATE forum_threads
          SET post_count = post_count + 1,
              last_post_at = CURRENT_TIMESTAMP
          WHERE id = NEW.thread_id;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_thread_on_post ON forum_posts;
      CREATE TRIGGER trigger_update_thread_on_post
          AFTER INSERT ON forum_posts
          FOR EACH ROW
          EXECUTE FUNCTION update_thread_on_post();
    `);

    // Create trigger to update thread post_count when a post is deleted
    await client.query(`
      CREATE OR REPLACE FUNCTION update_thread_on_post_delete()
      RETURNS TRIGGER AS $$
      BEGIN
          UPDATE forum_threads
          SET post_count = GREATEST(0, post_count - 1)
          WHERE id = OLD.thread_id;
          RETURN OLD;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_thread_on_post_delete ON forum_posts;
      CREATE TRIGGER trigger_update_thread_on_post_delete
          AFTER DELETE ON forum_posts
          FOR EACH ROW
          EXECUTE FUNCTION update_thread_on_post_delete();
    `);

    await client.query('COMMIT');
    console.log('Forum tables created successfully');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating forum tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

