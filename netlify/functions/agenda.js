// Fonction Netlify pour gérer les rendez-vous (AGENDA)
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Vérifier le JWT
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
    // Vérification de l'authentification
    verifyToken(event.headers.authorization || event.headers.Authorization);

    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    const sql = neon(databaseUrl);

    // GET : Liste des rendez-vous
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      
      // Filtres possibles
      const clientId = params.client_id;
      const dateDebut = params.date_debut; // Format: YYYY-MM-DD
      const dateFin = params.date_fin;
      const statut = params.statut;
      
      let query = `
        SELECT 
          r.*,
          c.nom,
          c.prenom,
          c.email,
          c.telephone,
          c.entreprise
        FROM rendez_vous r
        LEFT JOIN clients c ON r.client_id = c.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      if (clientId) {
        queryParams.push(parseInt(clientId));
        query += ` AND r.client_id = $${queryParams.length}`;
      }
      
      if (dateDebut) {
        queryParams.push(dateDebut);
        query += ` AND DATE(r.date_debut) >= $${queryParams.length}`;
      }
      
      if (dateFin) {
        queryParams.push(dateFin);
        query += ` AND DATE(r.date_fin) <= $${queryParams.length}`;
      }
      
      if (statut) {
        queryParams.push(statut);
        query += ` AND r.statut = $${queryParams.length}`;
      }
      
      query += ` ORDER BY r.date_debut ASC`;
      
      const rendezVous = await sql(query, queryParams);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: rendezVous }),
      };
    }

    // POST : Créer un rendez-vous
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const {
        client_id,
        titre,
        description,
        date_debut,
        date_fin,
        lieu,
        type_rdv,
        statut,
        rappel_avant,
        notes,
        couleur
      } = data;

      if (!titre || !date_debut || !date_fin) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Titre, date de début et date de fin requis' }),
        };
      }

      const result = await sql`
        INSERT INTO rendez_vous (
          client_id, titre, description, date_debut, date_fin,
          lieu, type_rdv, statut, rappel_avant, notes, couleur,
          created_at, updated_at
        )
        VALUES (
          ${client_id || null},
          ${titre},
          ${description || null},
          ${date_debut},
          ${date_fin},
          ${lieu || null},
          ${type_rdv || 'rendez-vous'},
          ${statut || 'planifie'},
          ${rappel_avant || null},
          ${notes || null},
          ${couleur || '#6366f1'},
          NOW(),
          NOW()
        )
        RETURNING *
      `;

      // Créer une activité si lié à un client
      if (client_id) {
        await sql`
          INSERT INTO activites (client_id, type_activite, titre, entite_type, entite_id)
          VALUES (
            ${client_id},
            'rdv_cree',
            ${`RDV: ${titre}`},
            'rendez_vous',
            ${result[0].id}
          )
        `;
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, data: result[0] }),
      };
    }

    // PUT : Modifier un rendez-vous
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id } = data;

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

      const fields = [
        'client_id', 'titre', 'description', 'date_debut', 'date_fin',
        'lieu', 'type_rdv', 'statut', 'rappel_avant', 'notes', 'couleur'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramCount}`);
          values.push(data[field]);
          paramCount++;
        }
      });

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
        UPDATE rendez_vous 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await sql(query, values);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: result[0] }),
      };
    }

    // DELETE : Supprimer un rendez-vous
    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters || {};

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      await sql`DELETE FROM rendez_vous WHERE id = ${parseInt(id)}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Rendez-vous supprimé' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };

  } catch (error) {
    console.error('Erreur agenda:', error);
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

