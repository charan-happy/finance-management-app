/**
 * Application configuration utility
 * Reads environment variables with proper fallbacks
 */

interface AppConfig {
    // Database
    dataMode: 'db' | 'local' | 'hybrid';
    databaseUrl?: string;
    
    // Broker
    useMockBroker: boolean;
    
    // Upstox
    upstox: {
        clientId?: string;
        clientSecret?: string;
        redirectUri: string;
    };
    
    // AngelOne
    angelone: {
        clientId?: string;
        clientSecret?: string;
    };
    
    // Fyers
    fyers: {
        clientId?: string;
        clientSecret?: string;
        redirectUri: string;
    };
    
    // App
    appUrl: string;
}

function getEnvVar(key: string, defaultValue = ''): string {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        return (import.meta as any).env[key] || defaultValue;
    }
    return defaultValue;
}

function getEnvBool(key: string, defaultValue = false): boolean {
    const value = getEnvVar(key);
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
}

export const config: AppConfig = {
    // Database Configuration
    dataMode: (getEnvVar('VITE_DATA_MODE', 'local') as 'db' | 'local' | 'hybrid'),
    databaseUrl: getEnvVar('VITE_DATABASE_URL'),
    
    // Broker Configuration
    useMockBroker: getEnvBool('VITE_USE_MOCK_BROKER', true),
    
    // Upstox
    upstox: {
        clientId: getEnvVar('VITE_UPSTOX_CLIENT_ID'),
        clientSecret: getEnvVar('VITE_UPSTOX_CLIENT_SECRET'),
        redirectUri: getEnvVar('VITE_UPSTOX_REDIRECT_URI', 'http://localhost:5173'),
    },
    
    // AngelOne
    angelone: {
        clientId: getEnvVar('VITE_ANGELONE_CLIENT_ID'),
        clientSecret: getEnvVar('VITE_ANGELONE_CLIENT_SECRET'),
    },
    
    // Fyers
    fyers: {
        clientId: getEnvVar('VITE_FYERS_CLIENT_ID'),
        clientSecret: getEnvVar('VITE_FYERS_CLIENT_SECRET'),
        redirectUri: getEnvVar('VITE_FYERS_REDIRECT_URI', 'http://localhost:5173'),
    },
    
    // Application
    appUrl: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
};

/**
 * Check if database is configured
 */
export function isDatabaseConfigured(): boolean {
    return !!(config.databaseUrl && config.databaseUrl.length > 0);
}

/**
 * Check if a specific broker is configured
 */
export function isBrokerConfigured(brokerId: 'upstox' | 'angelone' | 'fyers'): boolean {
    switch (brokerId) {
        case 'upstox':
            return !!(config.upstox.clientId && config.upstox.clientSecret);
        case 'angelone':
            return !!(config.angelone.clientId && config.angelone.clientSecret);
        case 'fyers':
            return !!(config.fyers.clientId && config.fyers.clientSecret);
        default:
            return false;
    }
}

export default config;
