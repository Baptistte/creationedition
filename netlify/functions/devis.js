// Fonction Netlify pour gérer les DEVIS (version simple)
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

    // GET : Liste des devis
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const devisId = params.id;
      
      if (devisId) {
        const devis = await sql`
          SELECT 
            d.*,
            c.nom,
            c.prenom,
            c.email,
            c.entreprise
          FROM devis d
          LEFT JOIN clients c ON d.client_id = c.id
          WHERE d.id = ${parseInt(devisId)}
        `;

        if (devis.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Devis non trouvé' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, devis: devis[0] }),
        };
      }

      // Liste complète
      const devisList = await sql`
        SELECT 
          d.*,
          c.nom,
          c.prenom,
          c.email,
          c.entreprise
        FROM devis d
        LEFT JOIN clients c ON d.client_id = c.id
        ORDER BY d.created_at DESC
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: devisList }),
      };
    }

    // POST : Créer un devis
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const { client_id, service, commentaire, prix, statut } = data;

      if (!client_id || !service || !prix) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Client, service et prix requis' }),
        };
      }

      // Générer le numéro de devis
      const numeroResult = await sql`SELECT generer_numero_devis() as numero`;
      const numero_devis = numeroResult[0].numero;

      const result = await sql`
        INSERT INTO devis (
          client_id, numero_devis, service, commentaire, prix, statut,
          date_creation, created_at, updated_at
        )
        VALUES (
          ${client_id},
          ${numero_devis},
          ${service},
          ${commentaire || null},
          ${prix},
          ${statut || 'en-attente'},
          NOW(), NOW(), NOW()
        )
        RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          success: true, 
          devis: result[0],
          message: `Devis ${numero_devis} créé`
        }),
      };
    }

    // PUT : Modifier un devis
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id, client_id, service, commentaire, prix, statut } = data;

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (client_id !== undefined) {
        updates.push(`client_id = $${paramCount}`);
        values.push(client_id);
        paramCount++;
      }

      if (service !== undefined) {
        updates.push(`service = $${paramCount}`);
        values.push(service);
        paramCount++;
      }

      if (commentaire !== undefined) {
        updates.push(`commentaire = $${paramCount}`);
        values.push(commentaire);
        paramCount++;
      }

      if (prix !== undefined) {
        updates.push(`prix = $${paramCount}`);
        values.push(prix);
        paramCount++;
      }

      if (statut !== undefined) {
        updates.push(`statut = $${paramCount}`);
        values.push(statut);
        paramCount++;

        // Mettre à jour les dates selon le statut
        if (statut === 'a-envoyer' || statut === 'envoye') {
          updates.push(`date_envoi = NOW()`);
        } else if (statut === 'accepte') {
          updates.push(`date_acceptation = NOW()`);
        } else if (statut === 'paye') {
          updates.push(`date_paiement = NOW()`);
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
        UPDATE devis 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await sql(query, values);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, devis: result[0] }),
      };
    }

    // DELETE : Supprimer un devis
    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters || {};

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      await sql`DELETE FROM devis WHERE id = ${parseInt(id)}`;

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
