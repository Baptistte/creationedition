import { getDb } from '../../db/connection.js';
import { projets, clients } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-a-changer';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

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
    verifyToken(event);
    const db = getDb();

    // GET - Liste des projets
    if (event.httpMethod === 'GET') {
      const allProjets = await db
        .select({
          projet: projets,
          client: clients,
        })
        .from(projets)
        .leftJoin(clients, eq(projets.clientId, clients.id))
        .orderBy(desc(projets.createdAt));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, projets: allProjets }),
      };
    }

    // POST - Créer un nouveau projet
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const [newProjet] = await db.insert(projets).values(data).returning();
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, projet: newProjet }),
      };
    }

    // PUT - Mettre à jour un projet
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id, ...updateData } = data;

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID projet requis' }),
        };
      }

      updateData.updatedAt = new Date();
      const [updatedProjet] = await db
        .update(projets)
        .set(updateData)
        .where(eq(projets.id, id))
        .returning();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, projet: updatedProjet }),
      };
    }

    // DELETE - Supprimer un projet
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID projet requis' }),
        };
      }

      await db.delete(projets).where(eq(projets.id, id));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Projet supprimé' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  } catch (error) {
    console.error('Erreur projets:', error);
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

