// Fonction de vérification de santé de la BDD
// Accessible publiquement pour vérifier que tout fonctionne

import { getDb } from '../../db/connection.js';
import { sql } from 'drizzle-orm';

export const handler = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const db = getDb();
    
    // Test de connexion simple
    const result = await db.execute(sql`SELECT 1 as test`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Health check failed:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

