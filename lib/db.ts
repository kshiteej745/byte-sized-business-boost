import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { mkdirSync } from 'fs';
import { join } from 'path';

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Create database connection
const sqlite = new Database(join(dataDir, 'app.db'));

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
