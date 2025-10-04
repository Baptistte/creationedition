import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
const db = drizzle(sql);

async function main() {
  console.log('🚀 Migration en cours...');
  
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('✅ Migration terminée avec succès!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur lors de la migration:', err);
  process.exit(1);
});

