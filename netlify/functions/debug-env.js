// Fonction de diagnostic pour voir les variables d'environnement disponibles
// ⚠️ À SUPPRIMER après avoir résolu le problème !

export const handler = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Liste les clés des variables d'environnement (pas les valeurs pour la sécurité)
    const envKeys = Object.keys(process.env).filter(key => {
      // Filtrer pour ne montrer que les variables pertinentes
      return key.includes('DATABASE') || 
             key.includes('JWT') || 
             key.includes('SETUP') ||
             key.includes('NEON') ||
             key.includes('NETLIFY');
    });

    // Vérifier spécifiquement SETUP_SECRET
    const setupSecretExists = !!process.env.SETUP_SECRET;
    const setupSecretValue = process.env.SETUP_SECRET ? 
      `${process.env.SETUP_SECRET.substring(0, 3)}...${process.env.SETUP_SECRET.substring(process.env.SETUP_SECRET.length - 3)}` : 
      'NON DÉFINI';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Variables d\'environnement disponibles',
        envKeys: envKeys.sort(),
        setupSecret: {
          exists: setupSecretExists,
          preview: setupSecretValue,
          length: process.env.SETUP_SECRET ? process.env.SETUP_SECRET.length : 0
        },
        allEnvKeysCount: Object.keys(process.env).length
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erreur',
        message: error.message
      }),
    };
  }
};

