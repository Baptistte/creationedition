import { getDb } from '../../db/connection.js';
import { factures, clients } from '../../db/schema.js';
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

function generateNumeroFacture() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `FACT-${year}-${timestamp}`;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    verifyToken(event);
    const db = getDb();

    // GET - Liste des factures
    if (event.httpMethod === 'GET') {
      const allFactures = await db
        .select({
          facture: factures,
          client: clients,
        })
        .from(factures)
        .leftJoin(clients, eq(factures.clientId, clients.id))
        .orderBy(desc(factures.createdAt));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, factures: allFactures }),
      };
    }

    // POST - Créer une nouvelle facture
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);

      if (!data.numeroFacture) {
        data.numeroFacture = generateNumeroFacture();
      }

      const [newFacture] = await db.insert(factures).values(data).returning();
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, facture: newFacture }),
      };
    }

    // PUT - Mettre à jour une facture
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id, ...updateData } = data;

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID facture requis' }),
        };
      }

      updateData.updatedAt = new Date();
      const [updatedFacture] = await db
        .update(factures)
        .set(updateData)
        .where(eq(factures.id, id))
        .returning();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, facture: updatedFacture }),
      };
    }

    // DELETE - Supprimer une facture
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID facture requis' }),
        };
      }

      await db.delete(factures).where(eq(factures.id, id));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Facture supprimée' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  } catch (error) {
    console.error('Erreur factures:', error);
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

