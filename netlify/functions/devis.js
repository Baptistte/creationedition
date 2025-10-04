import { getDb } from '../../db/connection.js';
import { devis, clients, lignesDevis } from '../../db/schema.js';
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

// Générer un numéro de devis unique
function generateNumeroDevis() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `DEV-${year}-${timestamp}`;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    verifyToken(event);
    const db = getDb();

    // GET - Liste des devis avec infos client
    if (event.httpMethod === 'GET') {
      const allDevis = await db
        .select({
          devis: devis,
          client: clients,
        })
        .from(devis)
        .leftJoin(clients, eq(devis.clientId, clients.id))
        .orderBy(desc(devis.createdAt));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, devis: allDevis }),
      };
    }

    // POST - Créer un nouveau devis
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const { lignes, ...devisData } = data;

      // Générer le numéro de devis si non fourni
      if (!devisData.numeroDevis) {
        devisData.numeroDevis = generateNumeroDevis();
      }

      // Créer le devis
      const [newDevis] = await db.insert(devis).values(devisData).returning();

      // Ajouter les lignes si fournies
      if (lignes && lignes.length > 0) {
        const lignesWithDevisId = lignes.map((ligne) => ({
          ...ligne,
          devisId: newDevis.id,
        }));
        await db.insert(lignesDevis).values(lignesWithDevisId);
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, devis: newDevis }),
      };
    }

    // PUT - Mettre à jour un devis
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id, lignes, ...updateData } = data;

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID devis requis' }),
        };
      }

      updateData.updatedAt = new Date();
      const [updatedDevis] = await db
        .update(devis)
        .set(updateData)
        .where(eq(devis.id, id))
        .returning();

      // Mettre à jour les lignes si fournies
      if (lignes) {
        // Supprimer les anciennes lignes
        await db.delete(lignesDevis).where(eq(lignesDevis.devisId, id));
        
        // Ajouter les nouvelles lignes
        if (lignes.length > 0) {
          const lignesWithDevisId = lignes.map((ligne) => ({
            ...ligne,
            devisId: id,
          }));
          await db.insert(lignesDevis).values(lignesWithDevisId);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, devis: updatedDevis }),
      };
    }

    // DELETE - Supprimer un devis
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID devis requis' }),
        };
      }

      // Supprimer les lignes associées
      await db.delete(lignesDevis).where(eq(lignesDevis.devisId, id));
      
      // Supprimer le devis
      await db.delete(devis).where(eq(devis.id, id));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Devis supprimé' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  } catch (error) {
    console.error('Erreur devis:', error);
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

