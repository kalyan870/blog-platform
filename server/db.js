import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let data;

function defaultData() {
  return { users: [], posts: [], comments: [] };
}

export async function initDb() {
  const dbPath = join(__dirname, 'store.json');
  if (existsSync(dbPath)) {
    try { data = JSON.parse(readFileSync(dbPath, 'utf-8')); }
    catch { data = defaultData(); }
  } else {
    data = defaultData();
  }
  return data;
}

export function saveDb() {
  try {
    const dbPath = join(__dirname, 'store.json');
    writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch {}
}

export function getDb() {
  if (!data) data = defaultData();
  return data;
}
