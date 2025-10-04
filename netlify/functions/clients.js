import { getDb } from '../../db/connection.js';
import { clients } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-a-changer';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// Middleware pour vérifier le token
function verifyToken(event) {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token manquant');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET);
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Vérifier l'authentification
    verifyToken(event);
    const db = getDb();

    // GET - Liste des clients
    if (event.httpMethod === 'GET') {
      const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, clients: allClients }),
      };
    }

    // POST - Créer un nouveau client
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const [newClient] = await db.insert(clients).values(data).returning();
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, client: newClient }),
      };
    }

    // PUT - Mettre à jour un client
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id, ...updateData } = data;
      
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID client requis' }),
        };
      }

      updateData.updatedAt = new Date();
      const [updatedClient] = await db
        .update(clients)
        .set(updateData)
        .where(eq(clients.id, id))
        .returning();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, client: updatedClient }),
      };
    }

    // DELETE - Supprimer un client
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);
      
      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID client requis' }),
        };
      }

      await db.delete(clients).where(eq(clients.id, id));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Client supprimé' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  } catch (error) {
    console.error('Erreur clients:', error);
    if (error.message === 'Token manquant' || error.name === 'JsonWebTokenError') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Non autorisé' }),
      };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur' }),
    };
  }
};

