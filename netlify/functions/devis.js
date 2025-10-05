// Fonction Netlify pour gérer les DEVIS
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
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Vérifier le token
    verifyToken(event.headers.authorization || event.headers.Authorization);

    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    const sql = neon(databaseUrl);

    // GET - Liste ou détail
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      
      if (params.id) {
        const result = await sql`
          SELECT 
            d.*,
            c.nom,
            c.prenom,
            c.email
          FROM devis d
          LEFT JOIN clients c ON d.client_id = c.id
          WHERE d.id = ${parseInt(params.id)}
        `;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, devis: result[0] }),
        };
      }

      // Liste complète
      const result = await sql`
        SELECT 
          d.*,
          c.nom,
          c.prenom,
          c.email
        FROM devis d
        LEFT JOIN clients c ON d.client_id = c.id
        ORDER BY d.created_at DESC
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: result }),
      };
    }

    // POST - Créer
    if (event.httpMethod === 'POST') {
      try {
        const data = JSON.parse(event.body);
        
        console.log('📝 Création devis - données reçues:', data);

        if (!data.client_id || !data.service || data.prix === undefined) {
          console.error('❌ Validation échouée:', data);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Client, service et prix requis' }),
          };
        }

        // Générer un numéro unique
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        const numero_devis = `DEV-${year}-${timestamp}`;
        
        console.log('🔢 Numéro généré:', numero_devis);

        // Insérer dans la base
        const result = await sql`
          INSERT INTO devis (
            client_id, numero_devis, service, commentaire, prix, statut,
            date_creation, created_at, updated_at
          )
          VALUES (
            ${data.client_id},
            ${numero_devis},
            ${data.service},
            ${data.commentaire || null},
            ${parseFloat(data.prix)},
            ${data.statut || 'en-attente'},
            NOW(), NOW(), NOW()
          )
          RETURNING *
        `;

        console.log('✅ Devis créé:', result[0]);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            devis: result[0],
            message: `Devis ${numero_devis} créé avec succès`
          }),
        };
        
      } catch (insertError) {
        console.error('❌ Erreur INSERT:', insertError);
        console.error('Stack:', insertError.stack);
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Erreur lors de la création du devis',
            details: insertError.message,
            hint: 'Vérifiez que la table devis existe dans Neon'
          }),
        };
      }
    }

    // PUT - Modifier
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);

      if (!data.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      const updates = [];
      const values = [];
      let idx = 1;

      if (data.client_id !== undefined) {
        updates.push(`client_id = $${idx++}`);
        values.push(data.client_id);
      }
      if (data.service !== undefined) {
        updates.push(`service = $${idx++}`);
        values.push(data.service);
      }
      if (data.commentaire !== undefined) {
        updates.push(`commentaire = $${idx++}`);
        values.push(data.commentaire);
      }
      if (data.prix !== undefined) {
        updates.push(`prix = $${idx++}`);
        values.push(parseFloat(data.prix));
      }
      if (data.statut !== undefined) {
        updates.push(`statut = $${idx++}`);
        values.push(data.statut);
        
        // Mettre à jour les dates
        if (data.statut === 'envoye' || data.statut === 'a-envoyer') {
          updates.push(`date_envoi = NOW()`);
        } else if (data.statut === 'accepte') {
          updates.push(`date_acceptation = NOW()`);
        } else if (data.statut === 'paye') {
          updates.push(`date_paiement = NOW()`);
        }
      }

      updates.push(`updated_at = NOW()`);
      values.push(data.id);

      const query = `
        UPDATE devis 
        SET ${updates.join(', ')}
        WHERE id = $${idx}
        RETURNING *
      `;

      const result = await sql(query, values);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, devis: result[0] }),
      };
    }

    // DELETE - Supprimer
    if (event.httpMethod === 'DELETE') {
      let id;
      
      if (event.queryStringParameters?.id) {
        id = event.queryStringParameters.id;
      } else if (event.body) {
        const data = JSON.parse(event.body);
        id = data.id;
      }

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
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    
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
      body: JSON.stringify({ 
        error: 'Erreur serveur',
        details: error.message 
      }),
    };
  }
};
