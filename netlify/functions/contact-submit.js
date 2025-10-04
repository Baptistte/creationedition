// Fonction pour recevoir les messages du formulaire de contact
// Crée automatiquement un client et enregistre le message

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
    const { prenom, nom, email, telephone, service, message } = data;

    // Validation
    if (!prenom || !nom || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Champs requis manquants' }),
      };
    }

    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    const sql = neon(databaseUrl);

    // 1. Vérifier si le client existe déjà
    const existingClients = await sql`
      SELECT * FROM clients WHERE email = ${email} LIMIT 1
    `;

    let clientId;
    let isNewClient = false;

    if (existingClients.length > 0) {
      // Client existant - Mettre à jour
      const client = existingClients[0];
      clientId = client.id;

      const nombreMessages = (client.nombre_messages || 0) + 1;
      const statut = nombreMessages >= 2 ? 'client-regulier' : (client.statut || 'prospect');

      await sql`
        UPDATE clients 
        SET 
          nombre_messages = ${nombreMessages},
          statut = ${statut},
          derniere_activite = NOW(),
          telephone = COALESCE(${telephone || null}, telephone),
          updated_at = NOW()
        WHERE id = ${clientId}
      `;
    } else {
      // Nouveau client - Créer
      isNewClient = true;
      
      const result = await sql`
        INSERT INTO clients (
          nom, prenom, email, telephone, 
          statut, nombre_messages, 
          premiere_prise_contact, derniere_activite,
          source, created_at, updated_at
        )
        VALUES (
          ${nom}, ${prenom}, ${email}, ${telephone || null},
          'prospect', 1,
          NOW(), NOW(),
          'formulaire-contact', NOW(), NOW()
        )
        RETURNING id
      `;

      clientId = result[0].id;
    }

    // 2. Enregistrer le message
    await sql`
      INSERT INTO messages (
        client_id, prenom, nom, email, telephone,
        service_interesse, message, 
        statut, lu, archive,
        date_reception, created_at, updated_at
      )
      VALUES (
        ${clientId}, ${prenom}, ${nom}, ${email}, ${telephone || null},
        ${service || null}, ${message},
        'nouveau', FALSE, FALSE,
        NOW(), NOW(), NOW()
      )
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Message envoyé avec succès',
        isNewClient,
      }),
    };
  } catch (error) {
    console.error('Erreur contact-submit:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erreur lors de l\'envoi du message',
        details: error.message,
      }),
    };
  }
};

