// Fonction pour initialiser la base de données en production
// ⚠️ ATTENTION : Cette fonction doit être sécurisée ou supprimée après usage
// Elle est utile pour la première configuration de la BDD sur Netlify

import { getDb } from '../../db/connection.js';
import { admins } from '../../db/schema.js';
import bcrypt from 'bcryptjs';

const SETUP_SECRET = process.env.SETUP_SECRET || 'changez-moi-avant-utilisation';

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Vérifier le secret pour éviter les accès non autorisés
  const authHeader = event.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${SETUP_SECRET}`) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        error: 'Non autorisé',
        message: 'Configurez SETUP_SECRET dans les variables d\'environnement Netlify'
      }),
    };
  }

  try {
    const db = getDb();

    // Vérifier si un admin existe déjà
    const existingAdmins = await db.select().from(admins).limit(1);

    if (existingAdmins.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'La base de données est déjà initialisée',
          admin: {
            email: existingAdmins[0].email,
          },
        }),
      };
    }

    // Créer un compte admin par défaut
    const defaultEmail = 'admin@creation-edition.fr';
    const defaultPassword = 'Admin@2025';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const [newAdmin] = await db.insert(admins).values({
      email: defaultEmail,
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'Système',
    }).returning();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Base de données initialisée avec succès',
        admin: {
          email: newAdmin.email,
          defaultPassword: defaultPassword,
          warning: 'Changez ce mot de passe immédiatement !',
        },
      }),
    };
  } catch (error) {
    console.error('Erreur setup DB:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erreur lors de l\'initialisation',
        message: error.message,
        details: 'Vérifiez que les tables existent (migrations appliquées)',
      }),
    };
  }
};

