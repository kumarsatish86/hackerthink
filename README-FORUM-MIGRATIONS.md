# Forum Database Migrations

## Overview
This document explains how to run the forum database migrations to create all necessary tables for the community forum feature.

## Option 1: Run via Admin Panel (Recommended)

1. Navigate to `/admin/forum` in your browser
2. Click the **"Run Database Migrations"** button at the top right
3. Confirm the action when prompted
4. Check the result message displayed below the button

If you see errors, check the browser console (F12) for detailed error messages.

## Option 2: Run via Command Line

If the admin panel button doesn't work, you can run the migrations directly from the command line:

```bash
npm run db:forum-migrate
```

Or directly:

```bash
node scripts/run-forum-migrations.js
```

## Tables Created

The migration will create the following tables:

1. **forum_categories** - Forum categories/sub-forums
2. **forum_threads** - Discussion threads
3. **forum_posts** - Individual posts/replies
4. **forum_likes** - Post likes/upvotes
5. **forum_mentions** - User mentions in posts
6. **forum_notifications** - User notifications
7. **forum_subscriptions** - Thread subscriptions
8. **forum_bookmarks** - User bookmarks
9. **forum_reports** - Content reports
10. **forum_roles** - Forum-specific roles
11. **user_forum_roles** - User role assignments

Additionally, it extends the **users** table with:
- avatar_url
- bio
- location
- social_links (JSONB)
- last_active
- forum_reputation
- forum_post_count
- is_banned
- ban_expires_at

## Troubleshooting

### Error: "relation already exists"
This means the tables already exist. The migration is idempotent and will skip creating existing tables.

### Error: "permission denied"
Make sure your database user has CREATE TABLE permissions.

### Error: "connection refused"
Check your database connection settings in `.env`:
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

### No tables created
1. Check the browser console for errors
2. Check the server logs for detailed error messages
3. Try running the command line script instead
4. Verify database connection is working

## Verification

After running migrations, verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'forum_%'
ORDER BY table_name;
```

You should see all the forum_* tables listed.

