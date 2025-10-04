// Fonction pour voir tous les headers reçus
export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: true,
      message: 'Headers reçus',
      headers: event.headers,
      method: event.httpMethod,
      path: event.path,
      allHeaderKeys: Object.keys(event.headers)
    }, null, 2),
  };
};

