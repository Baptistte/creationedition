import { getDb } from '../../db/connection.js';
import { admins } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-a-changer';

export const handler = async (event) => {
  // Gestion CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Répondre aux requêtes OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email et mot de passe requis' }),
      };
    }

    const db = getDb();

    // Trouver l'admin par email
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));

    if (!admin) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Identifiants incorrects' }),
      };
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Identifiants incorrects' }),
      };
    }

    // Générer un token JWT
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          nom: admin.nom,
          prenom: admin.prenom,
        },
      }),
    };
  } catch (error) {
    console.error('Erreur login:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur' }),
    };
  }
};

