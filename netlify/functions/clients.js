// Fonction Netlify pour gérer les CLIENTS (version complète avec historique)
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

    // GET - Liste des clients OU détail d'un client avec historique
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const clientId = params.id;
      
      // Cas 1: Détail d'un client avec TOUT son historique
      if (clientId) {
        // Infos du client
        const clientData = await sql`
          SELECT * FROM clients WHERE id = ${parseInt(clientId)}
        `;

        if (clientData.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Client non trouvé' }),
          };
        }

        const client = clientData[0];

        // Historique des devis
        const devis = await sql`
          SELECT 
            id, numero_devis, titre, statut, 
            date_creation, date_envoi, date_reponse,
            montant_ht, montant_ttc
          FROM devis 
          WHERE client_id = ${parseInt(clientId)}
          ORDER BY date_creation DESC
        `;

        // Historique des messages
        const messages = await sql`
          SELECT 
            id, service_interesse, message, statut,
            date_reception, lu, archive, tags
          FROM messages 
          WHERE client_id = ${parseInt(clientId)}
          ORDER BY date_reception DESC
        `;

        // Historique des rendez-vous
        const rendezVous = await sql`
          SELECT 
            id, titre, type_rdv, statut,
            date_debut, date_fin, lieu
          FROM rendez_vous 
          WHERE client_id = ${parseInt(clientId)}
          ORDER BY date_debut DESC
        `;

        // Historique des activités
        const activites = await sql`
          SELECT 
            id, type_activite, titre, description,
            entite_type, entite_id, created_at
          FROM activites 
          WHERE client_id = ${parseInt(clientId)}
          ORDER BY created_at DESC
          LIMIT 50
        `;

        // Statistiques
        const stats = {
          nb_devis: devis.length,
          nb_devis_acceptes: devis.filter(d => d.statut === 'accepte').length,
          nb_devis_en_cours: devis.filter(d => ['brouillon', 'envoye'].includes(d.statut)).length,
          ca_total: devis
            .filter(d => d.statut === 'accepte')
            .reduce((sum, d) => sum + parseFloat(d.montant_ttc || 0), 0),
          nb_messages: messages.length,
          nb_messages_non_lus: messages.filter(m => !m.lu).length,
          nb_rendez_vous: rendezVous.length,
          prochain_rdv: rendezVous.find(r => new Date(r.date_debut) > new Date() && r.statut === 'planifie'),
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            client,
            devis,
            messages,
            rendezVous,
            activites,
            stats
          }),
        };
      }

      // Cas 2: Liste de tous les clients avec statistiques
      const statut = params.statut;
      const tags = params.tags;
      
      let query = `
        SELECT 
          c.*,
          COUNT(DISTINCT d.id) as nb_devis,
          COUNT(DISTINCT CASE WHEN d.statut = 'accepte' THEN d.id END) as nb_devis_acceptes,
          COALESCE(SUM(CASE WHEN d.statut = 'accepte' THEN d.montant_ttc ELSE 0 END), 0) as ca_total,
          COUNT(DISTINCT m.id) as nb_messages,
          COUNT(DISTINCT CASE WHEN m.lu = FALSE THEN m.id END) as nb_messages_non_lus
        FROM clients c
        LEFT JOIN devis d ON c.id = d.client_id
        LEFT JOIN messages m ON c.id = m.client_id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      if (statut) {
        queryParams.push(statut);
        query += ` AND c.statut = $${queryParams.length}`;
      }
      
      if (tags) {
        queryParams.push(tags.split(','));
        query += ` AND c.tags && $${queryParams.length}`;
      }
      
      query += ` GROUP BY c.id ORDER BY c.created_at DESC`;
      
      const clients = await sql(query, queryParams);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: clients }),
      };
    }

    // POST - Créer un nouveau client
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const {
        nom, prenom, email, telephone, entreprise, siret,
        adresse, code_postal, ville, statut, tags, notes_internes, source
      } = data;

      if (!nom || !prenom || !email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Nom, prénom et email requis' }),
        };
      }

      // Vérifier si le client existe déjà
      const existing = await sql`
        SELECT * FROM clients WHERE email = ${email}
      `;

      if (existing.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Un client avec cet email existe déjà' }),
        };
      }

      const result = await sql`
        INSERT INTO clients (
          nom, prenom, email, telephone, entreprise, siret,
          adresse, code_postal, ville, statut, tags, notes_internes,
          source, premiere_prise_contact, derniere_activite,
          created_at, updated_at
        )
        VALUES (
          ${nom}, ${prenom}, ${email}, ${telephone || null}, 
          ${entreprise || null}, ${siret || null},
          ${adresse || null}, ${code_postal || null}, ${ville || null},
          ${statut || 'prospect'}, ${tags || []}, ${notes_internes || null},
          ${source || 'manuel'}, NOW(), NOW(),
          NOW(), NOW()
        )
        RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, client: result[0] }),
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
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      const fields = [
        'nom', 'prenom', 'email', 'telephone', 'entreprise', 'siret',
        'adresse', 'code_postal', 'ville', 'statut', 'tags',
        'notes_internes', 'source'
      ];

      fields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = $${paramCount}`);
          values.push(updateData[field]);
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

      updates.push(`derniere_activite = NOW()`);
      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE clients 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await sql(query, values);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, client: result[0] }),
      };
    }

    // DELETE - Supprimer un client
    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters || {};

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      // Note: Les devis, messages, etc. seront supprimés en CASCADE
      await sql`DELETE FROM clients WHERE id = ${parseInt(id)}`;

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
