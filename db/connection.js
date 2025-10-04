import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

let db = null;

export function getDb() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL, NEON_DATABASE_URL ou NETLIFY_DATABASE_URL doit être défini');
    }
    
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
  }
  
  return db;
}

