import type { PoolClient, QueryResult, QueryResultRow } from 'pg';

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>>;

export function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null>;

export function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;

export function end(): Promise<void>;

declare const db: {
  query: typeof query;
  queryOne: typeof queryOne;
  transaction: typeof transaction;
  end: typeof end;
};

export default db;
