import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * Netlify serverless function to handle database operations
 * Endpoint: /.netlify/functions/data
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const databaseUrl = process.env.VITE_DATABASE_URL;
  if (!databaseUrl) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'Database not configured' }),
    };
  }

  try {
    const sql = neon(databaseUrl);

    // GET - Retrieve user data
    if (event.httpMethod === 'GET') {
      const userId = event.queryStringParameters?.userId;
      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing userId parameter' }),
        };
      }

      const result = await sql`
        SELECT data FROM user_data WHERE user_id = ${userId}
      `;

      if (result.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User data not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: result[0].data }),
      };
    }

    // POST/PUT - Save user data
    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      const { userId, data } = JSON.parse(event.body || '{}');

      if (!userId || !data) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing userId or data' }),
        };
      }

      await sql`
        INSERT INTO user_data (user_id, data, updated_at)
        VALUES (${userId}, ${JSON.stringify(data)}, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET 
          data = ${JSON.stringify(data)},
          updated_at = CURRENT_TIMESTAMP
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
};

export { handler };
