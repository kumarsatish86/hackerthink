import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

for (const f of ['.env.local', '.env']) {
  const p = resolve(process.cwd(), f);
  if (existsSync(p)) config({ path: p, override: false });
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const sql = readFileSync(
  resolve(process.cwd(), 'src/lib/migrations/sql/014_course_lesson_content_type.sql'),
  'utf8'
);
await pool.query(sql);
console.log('Applied 014_course_lesson_content_type.sql');
await pool.end();
