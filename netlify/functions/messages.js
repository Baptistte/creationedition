// API pour gérer les messages reçus via le formulaire de contact

import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-a-changer';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function verifyToken(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
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
    
    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    const sql = neon(databaseUrl);

    // GET - Liste tous les messages avec infos client
    if (event.httpMethod === 'GET') {
      const messages = await sql`
        SELECT 
          m.*,
          c.entreprise as client_entreprise,
          c.statut as client_statut
        FROM messages m
        LEFT JOIN clients c ON m.client_id = c.id
        ORDER BY m.date_reception DESC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, messages }),
      };
    }

    // PUT - Mettre à jour un message (marquer comme lu, archiver, etc.)
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id, statut, lu, archive, priorite, notes_internes } = data;

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID message requis' }),
        };
      }

      // Construire dynamiquement les parties de la requête
      const updates = [];
      
      if (statut !== undefined) updates.push(`statut = '${statut}'`);
      if (lu !== undefined) {
        updates.push(`lu = ${lu}`);
        if (lu) updates.push(`date_lecture = NOW()`);
      }
      if (archive !== undefined) updates.push(`archive = ${archive}`);
      if (priorite !== undefined) updates.push(`priorite = '${priorite}'`);
      if (notes_internes !== undefined) updates.push(`notes_internes = ${notes_internes ? `'${notes_internes.replace(/'/g, "''")}'` : 'NULL'}`);
      
      updates.push('updated_at = NOW()');

      // Exécuter la mise à jour
      await sql.unsafe(`
        UPDATE messages 
        SET ${updates.join(', ')}
        WHERE id = ${id}
      `);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Message mis à jour' }),
      };
    }

    // DELETE - Supprimer un message
    if (event.httpMethod === 'DELETE') {
      const { id } = JSON.parse(event.body);

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID message requis' }),
        };
      }

      await sql`DELETE FROM messages WHERE id = ${id}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Message supprimé' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  } catch (error) {
    console.error('Erreur messages:', error);
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
      body: JSON.stringify({ error: 'Erreur serveur', details: error.message }),
    };
  }
};

