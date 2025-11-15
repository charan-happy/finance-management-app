import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * Netlify serverless function to sync broker data
 * Endpoint: /.netlify/functions/sync-broker
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, brokerId, accessToken } = JSON.parse(event.body || '{}');

    if (!userId || !brokerId || !accessToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: userId, brokerId, accessToken' }),
      };
    }

    // Here you would implement actual broker API calls
    // For now, returning mock data
    const holdings = [
      {
        id: crypto.randomUUID(),
        name: 'RELIANCE',
        type: 'Stock',
        quantity: 10,
        avgPrice: 2450.50,
        currentPrice: 2500.00,
        brokerId,
      },
    ];

    // If database is configured, save to database
    const databaseUrl = process.env.VITE_DATABASE_URL;
    if (databaseUrl) {
      const sql = neon(databaseUrl);
      // Update user's holdings in database
      // Implementation depends on your schema
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, holdings }),
    };
  } catch (error: any) {
    console.error('Sync error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};

export { handler };
