// Fonction pour recevoir les messages du formulaire de contact
// Crée automatiquement un client et enregistre le message

import { neon } from '@neondatabase/serverless';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://creationeditionbroderie.com',
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

    // Validation et sanitisation
    const strip = (v) => (typeof v === 'string' ? v.trim().slice(0, 500) : '');
    const clean = {
      prenom: strip(prenom),
      nom: strip(nom),
      email: strip(email).toLowerCase(),
      telephone: strip(telephone).slice(0, 20),
      service: strip(service).slice(0, 100),
      message: strip(message).slice(0, 2000),
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clean.prenom || !clean.nom || !clean.email || !clean.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Champs requis manquants' }),
      };
    }
    if (!emailRegex.test(clean.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email invalide' }),
      };
    }

    const { prenom: p, nom: n, email: e, telephone: t, service: s, message: m } = clean;

    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    const sql = neon(databaseUrl);

    // 1. Vérifier si le client existe déjà
    const existingClients = await sql`
      SELECT * FROM clients WHERE email = ${e} LIMIT 1
    `;

    let clientId;
    let isNewClient = false;

    if (existingClients.length > 0) {
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
          telephone = COALESCE(${t || null}, telephone),
          updated_at = NOW()
        WHERE id = ${clientId}
      `;
    } else {
      isNewClient = true;

      const result = await sql`
        INSERT INTO clients (
          nom, prenom, email, telephone,
          statut, nombre_messages,
          premiere_prise_contact, derniere_activite,
          source, created_at, updated_at
        )
        VALUES (
          ${n}, ${p}, ${e}, ${t || null},
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
        ${clientId}, ${p}, ${n}, ${e}, ${t || null},
        ${s || null}, ${m},
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

