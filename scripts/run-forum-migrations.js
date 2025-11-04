const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createForumTables() {
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
      console.log('✓ Created forum_categories table');
    } else {
      console.log('✓ forum_categories table already exists');
    }

    // 2. Create forum_threads table
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
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
      await client.query(`CREATE INDEX idx_forum_threads_category_id ON forum_threads(category_id)`);
      await client.query(`CREATE INDEX idx_forum_threads_user_id ON forum_threads(user_id)`);
      await client.query(`CREATE INDEX idx_forum_threads_slug ON forum_threads(slug)`);
      await client.query(`CREATE INDEX idx_forum_threads_last_post_at ON forum_threads(last_post_at DESC)`);
      await client.query(`CREATE INDEX idx_forum_threads_created_at ON forum_threads(created_at DESC)`);
      await client.query(`CREATE INDEX idx_forum_threads_is_locked ON forum_threads(is_locked)`);
      await client.query(`CREATE INDEX idx_forum_threads_is_sticky ON forum_threads(is_sticky)`);
      await client.query(`CREATE INDEX idx_forum_threads_is_solved ON forum_threads(is_solved)`);
      await client.query(`CREATE INDEX idx_forum_threads_views ON forum_threads(views DESC)`);
      await client.query(`CREATE INDEX idx_forum_threads_title_fts ON forum_threads USING gin(to_tsvector('english', title))`);
      console.log('✓ Created forum_threads table');
    } else {
      console.log('✓ forum_threads table already exists');
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
          thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_edited BOOLEAN DEFAULT FALSE,
          edited_at TIMESTAMP WITH TIME ZONE
        )
      `);
      await client.query(`CREATE INDEX idx_forum_posts_thread_id ON forum_posts(thread_id)`);
      await client.query(`CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id)`);
      await client.query(`CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at ASC)`);
      await client.query(`CREATE INDEX idx_forum_posts_updated_at ON forum_posts(updated_at DESC)`);
      await client.query(`CREATE INDEX idx_forum_posts_content_fts ON forum_posts USING gin(to_tsvector('english', content))`);
      console.log('✓ Created forum_posts table');
    } else {
      console.log('✓ forum_posts table already exists');
    }

    // Add foreign key constraint for solved_post_id after posts table exists
    const solvedPostFkCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_threads_solved_post_id_fkey'
        AND table_name = 'forum_threads'
      )
    `);

    if (!solvedPostFkCheck.rows[0].exists && postsCheck.rows[0].exists) {
      await client.query(`
        ALTER TABLE forum_threads
        ADD CONSTRAINT forum_threads_solved_post_id_fkey
        FOREIGN KEY (solved_post_id) REFERENCES forum_posts(id) ON DELETE SET NULL;
      `);
      console.log('✓ Added solved_post_id foreign key constraint');
    }

    // Continue with other tables...
    const otherTables = [
      { name: 'forum_likes', createSQL: `CREATE TABLE forum_likes (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(post_id, user_id)
        )`, indexes: [
          `CREATE INDEX idx_forum_likes_post_id ON forum_likes(post_id)`,
          `CREATE INDEX idx_forum_likes_user_id ON forum_likes(user_id)`
        ]},
      { name: 'forum_mentions', createSQL: `CREATE TABLE forum_mentions (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
          mentioned_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`, indexes: [
          `CREATE INDEX idx_forum_mentions_post_id ON forum_mentions(post_id)`,
          `CREATE INDEX idx_forum_mentions_mentioned_user_id ON forum_mentions(mentioned_user_id)`
        ]},
      { name: 'forum_notifications', createSQL: `CREATE TABLE forum_notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          reference_id INTEGER,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`, indexes: [
          `CREATE INDEX idx_forum_notifications_user_id ON forum_notifications(user_id)`,
          `CREATE INDEX idx_forum_notifications_is_read ON forum_notifications(is_read)`,
          `CREATE INDEX idx_forum_notifications_created_at ON forum_notifications(created_at DESC)`,
          `CREATE INDEX idx_forum_notifications_user_read ON forum_notifications(user_id, is_read)`
        ]},
      { name: 'forum_subscriptions', createSQL: `CREATE TABLE forum_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, thread_id)
        )`, indexes: [
          `CREATE INDEX idx_forum_subscriptions_user_id ON forum_subscriptions(user_id)`,
          `CREATE INDEX idx_forum_subscriptions_thread_id ON forum_subscriptions(thread_id)`
        ]},
      { name: 'forum_bookmarks', createSQL: `CREATE TABLE forum_bookmarks (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, thread_id)
        )`, indexes: [
          `CREATE INDEX idx_forum_bookmarks_user_id ON forum_bookmarks(user_id)`,
          `CREATE INDEX idx_forum_bookmarks_thread_id ON forum_bookmarks(thread_id)`
        ]},
      { name: 'forum_reports', createSQL: `CREATE TABLE forum_reports (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reason TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP WITH TIME ZONE,
          resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
        )`, indexes: [
          `CREATE INDEX idx_forum_reports_post_id ON forum_reports(post_id)`,
          `CREATE INDEX idx_forum_reports_user_id ON forum_reports(user_id)`,
          `CREATE INDEX idx_forum_reports_status ON forum_reports(status)`,
          `CREATE INDEX idx_forum_reports_created_at ON forum_reports(created_at DESC)`
        ]},
      { name: 'forum_roles', createSQL: `CREATE TABLE forum_roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`, indexes: [
          `CREATE INDEX idx_forum_roles_name ON forum_roles(name)`
        ]},
      { name: 'user_forum_roles', createSQL: `CREATE TABLE user_forum_roles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role_id INTEGER NOT NULL REFERENCES forum_roles(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE(user_id, role_id)
        )`, indexes: [
          `CREATE INDEX idx_user_forum_roles_user_id ON user_forum_roles(user_id)`,
          `CREATE INDEX idx_user_forum_roles_role_id ON user_forum_roles(role_id)`
        ]},
    ];

    for (const table of otherTables) {
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table.name]);

      if (!tableCheck.rows[0].exists) {
        await client.query(table.createSQL);
        for (const indexSQL of table.indexes) {
          await client.query(indexSQL);
        }
        console.log(`✓ Created ${table.name} table`);
      } else {
        console.log(`✓ ${table.name} table already exists`);
      }
    }

    // Create triggers
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    const triggers = [
      { table: 'forum_categories', trigger: 'update_forum_categories_updated_at' },
      { table: 'forum_threads', trigger: 'update_forum_threads_updated_at' },
      { table: 'forum_posts', trigger: 'update_forum_posts_updated_at' },
    ];

    for (const { table, trigger } of triggers) {
      await client.query(`DROP TRIGGER IF EXISTS ${trigger} ON ${table}`);
      await client.query(`
        CREATE TRIGGER ${trigger}
            BEFORE UPDATE ON ${table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Create thread update triggers
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

    await client.query(`DROP TRIGGER IF EXISTS trigger_update_thread_on_post ON forum_posts`);
    await client.query(`
      CREATE TRIGGER trigger_update_thread_on_post
          AFTER INSERT ON forum_posts
          FOR EACH ROW
          EXECUTE FUNCTION update_thread_on_post();
    `);

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

    await client.query(`DROP TRIGGER IF EXISTS trigger_update_thread_on_post_delete ON forum_posts`);
    await client.query(`
      CREATE TRIGGER trigger_update_thread_on_post_delete
          AFTER DELETE ON forum_posts
          FOR EACH ROW
          EXECUTE FUNCTION update_thread_on_post_delete();
    `);

    await client.query('COMMIT');
    console.log('\n✅ Forum tables created successfully!');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error creating forum tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function extendUsersForForum() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('\nExtending users table for forum...');

    const columns = [
      { name: 'avatar_url', sql: 'VARCHAR(500)', defaultValue: null },
      { name: 'bio', sql: 'TEXT', defaultValue: null },
      { name: 'location', sql: 'VARCHAR(255)', defaultValue: null },
      { name: 'social_links', sql: 'JSONB DEFAULT \'{}\'::jsonb', defaultValue: '{}' },
      { name: 'last_active', sql: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP', defaultValue: null },
      { name: 'forum_reputation', sql: 'INTEGER DEFAULT 0', defaultValue: 0 },
      { name: 'forum_post_count', sql: 'INTEGER DEFAULT 0', defaultValue: 0 },
      { name: 'is_banned', sql: 'BOOLEAN DEFAULT FALSE', defaultValue: false },
      { name: 'ban_expires_at', sql: 'TIMESTAMP WITH TIME ZONE', defaultValue: null },
    ];

    for (const column of columns) {
      const check = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = $1
        )
      `, [column.name]);

      if (!check.rows[0].exists) {
        await client.query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.sql}`);
        if (column.name === 'last_active') {
          await client.query(`CREATE INDEX idx_users_last_active ON users(last_active DESC)`);
        }
        if (column.name === 'forum_reputation') {
          await client.query(`CREATE INDEX idx_users_forum_reputation ON users(forum_reputation DESC)`);
        }
        if (column.name === 'is_banned') {
          await client.query(`CREATE INDEX idx_users_is_banned ON users(is_banned)`);
        }
        console.log(`✓ Added ${column.name} column to users table`);
      } else {
        console.log(`✓ ${column.name} column already exists in users table`);
      }
    }

    // Create triggers for post count
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
      console.log('✓ Created trigger to update user forum_post_count');
    }

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
      console.log('✓ Created trigger to decrement user forum_post_count on delete');
    }

    await client.query('COMMIT');
    console.log('\n✅ Users table extended for forum successfully!');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error extending users table for forum:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations() {
  console.log('🚀 Starting Forum Database Migrations...\n');
  
  try {
    await createForumTables();
    await extendUsersForForum();
    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

