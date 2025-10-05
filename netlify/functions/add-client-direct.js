// Fonction simple pour ajouter un client directement (TEST)
import { neon } from '@neondatabase/serverless';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { prenom, nom, email } = data;

    // Validation
    if (!prenom || !nom || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prénom, nom et email requis' }),
      };
    }

    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    const sql = neon(databaseUrl);

    // Vérifier si le client existe déjà
    const existing = await sql`
      SELECT * FROM clients WHERE email = ${email} LIMIT 1
    `;

    if (existing.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Ce client existe déjà',
          clientId: existing[0].id 
        }),
      };
    }

    // Ajouter le client
    const result = await sql`
      INSERT INTO clients (
        nom, prenom, email,
        statut, nombre_messages,
        source, created_at, updated_at
      )
      VALUES (
        ${nom}, ${prenom}, ${email},
        'prospect', 0,
        'inscription-directe', NOW(), NOW()
      )
      RETURNING *
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Client ajouté avec succès !',
        client: result[0],
      }),
    };
  } catch (error) {
    console.error('Erreur add-client-direct:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erreur lors de l\'ajout',
        details: error.message,
      }),
    };
  }
};

