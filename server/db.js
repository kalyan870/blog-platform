import { neon } from '@neondatabase/serverless';

let sql;

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  sql ??= neon(process.env.DATABASE_URL);
  return sql;
}

export async function initDb() {
  await db()`SELECT 1`;
}

export const query = (strings, ...values) => db()(strings, ...values);
