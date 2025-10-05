// API pour gérer les messages reçus via le formulaire de contact (VERSION AMÉLIORÉE)
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

function verifyToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Token manquant');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    verifyToken(event.headers.authorization || event.headers.Authorization);
    
    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    const sql = neon(databaseUrl);

    // GET - Liste tous les messages avec infos client et filtres
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const statut = params.statut;
      const categorie = params.categorie;
      const archive = params.archive;
      
      let query = `
        SELECT 
          m.*,
          c.entreprise as client_entreprise,
          c.statut as client_statut,
          c.nom as client_nom,
          c.prenom as client_prenom
        FROM messages m
        LEFT JOIN clients c ON m.client_id = c.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      if (statut) {
        queryParams.push(statut);
        query += ` AND m.statut = $${queryParams.length}`;
      }
      
      if (categorie) {
        queryParams.push(categorie);
        query += ` AND m.categorie = $${queryParams.length}`;
      }
      
      if (archive !== undefined) {
        queryParams.push(archive === 'true');
        query += ` AND m.archive = $${queryParams.length}`;
      }
      
      query += ` ORDER BY m.date_reception DESC`;
      
      const messages = await sql(query, queryParams);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: messages }),
      };
    }

    // PUT - Mettre à jour un message (statut, tags, catégorie, etc.)
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id, statut, lu, archive, priorite, notes_internes, tags, categorie, reponse } = data;

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID message requis' }),
        };
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (statut !== undefined) {
        updates.push(`statut = $${paramCount}`);
        values.push(statut);
        paramCount++;
      }

      if (lu !== undefined) {
        updates.push(`lu = $${paramCount}`);
        values.push(lu);
        paramCount++;
        
        if (lu) {
          updates.push(`date_lecture = NOW()`);
        }
      }

      if (archive !== undefined) {
        updates.push(`archive = $${paramCount}`);
        values.push(archive);
        paramCount++;
      }

      if (priorite !== undefined) {
        updates.push(`priorite = $${paramCount}`);
        values.push(priorite);
        paramCount++;
      }

      if (notes_internes !== undefined) {
        updates.push(`notes_internes = $${paramCount}`);
        values.push(notes_internes);
        paramCount++;
      }

      if (tags !== undefined) {
        // Tags est un tableau
        updates.push(`tags = $${paramCount}`);
        values.push(tags);
        paramCount++;
      }

      if (categorie !== undefined) {
        updates.push(`categorie = $${paramCount}`);
        values.push(categorie);
        paramCount++;
      }

      if (reponse !== undefined) {
        updates.push(`reponse = $${paramCount}`);
        values.push(reponse);
        paramCount++;
        
        if (reponse) {
          updates.push(`date_reponse = NOW()`);
        }
      }

      if (updates.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Aucune donnée à mettre à jour' }),
        };
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE messages 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await sql(query, values);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Message mis à jour', data: result[0] }),
      };
    }

    // DELETE - Supprimer un message
    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters || {};

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      await sql`DELETE FROM messages WHERE id = ${parseInt(id)}`;

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
    return {
      statusCode: error.message === 'Token manquant' ? 401 : 500,
      headers,
      body: JSON.stringify({
        error: error.message === 'Token manquant' ? 'Non autorisé' : 'Erreur serveur',
        details: error.message,
      }),
    };
  }
};
