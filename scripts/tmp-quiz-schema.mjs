import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

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

for (const table of ['quizzes', 'course_quizzes', 'quiz_questions', 'quiz_answers']) {
  const cols = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name=$1 ORDER BY ordinal_position`,
    [table]
  );
  console.log('\n' + table + ':');
  console.log(cols.rows.map((r) => `${r.column_name} (${r.data_type})`).join('\n') || '(missing)');
}
await pool.end();
