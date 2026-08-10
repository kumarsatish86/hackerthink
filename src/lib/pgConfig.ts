/**
 * Shared Postgres pool options for local + Neon/Vercel.
 * Set DB_SSL=true in production (Neon). Leave unset/false for local Postgres.
 */
export type PgPoolOptions = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: false | { rejectUnauthorized: boolean };
  max?: number;
};

export function getPgSslOption(): false | { rejectUnauthorized: boolean } {
  return process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
}

/** Base connection fields from env (with sensible local defaults). */
export function getPgPoolOptions(overrides: Partial<PgPoolOptions> = {}): PgPoolOptions {
  const { ssl: sslOverride, ...rest } = overrides;
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Admin1234',
    database: process.env.DB_NAME || 'hackerthink',
    ...rest,
    ssl: sslOverride !== undefined ? sslOverride : getPgSslOption(),
  };
}
