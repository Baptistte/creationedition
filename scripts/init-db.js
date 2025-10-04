import { getDb } from '../db/connection.js';
import { admins } from '../db/schema.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function initDb() {
  console.log('🔧 Initialisation de la base de données...');
  
  const db = getDb();
  
  // Créer un compte admin par défaut
  const defaultEmail = 'admin@creation-edition.fr';
  const defaultPassword = 'Admin@2025'; // À changer après la première connexion
  
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await db.select().from(admins).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('ℹ️  Un compte admin existe déjà.');
      console.log('📧 Email:', existingAdmin[0].email);
    } else {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      // Créer l'admin
      const [newAdmin] = await db.insert(admins).values({
        email: defaultEmail,
        password: hashedPassword,
        nom: 'Admin',
        prenom: 'Système',
      }).returning();
      
      console.log('✅ Compte admin créé avec succès!');
      console.log('📧 Email:', defaultEmail);
      console.log('🔑 Mot de passe:', defaultPassword);
      console.log('⚠️  IMPORTANT: Changez ce mot de passe après votre première connexion!');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
  
  console.log('🎉 Initialisation terminée!');
}

initDb();

