import axios, { AxiosInstance } from 'axios';
import { InvestmentHolding, InvestmentType } from '../types';

/**
 * Broker authentication response
 */
export interface BrokerAuthResponse {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
}

/**
 * Abstract interface for broker integrations
 */
export interface IBrokerService {
    authenticate(clientId: string, clientSecret: string, redirectUri?: string): Promise<BrokerAuthResponse>;
    refreshAccessToken?(refreshToken: string): Promise<BrokerAuthResponse>;
    fetchHoldings(accessToken: string): Promise<InvestmentHolding[]>;
    fetchPositions?(accessToken: string): Promise<any[]>;
    isConnected(): boolean;
}

/**
 * Upstox broker implementation
 * API Docs: https://upstox.com/developer/api-documentation
 */
export class UpstoxBrokerService implements IBrokerService {
    private readonly baseUrl = 'https://api.upstox.com/v2';
    private apiClient: AxiosInstance;
    private connected = false;

    constructor() {
        this.apiClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }

    async authenticate(clientId: string, clientSecret: string, redirectUri?: string): Promise<BrokerAuthResponse> {
        try {
            // Check if clientSecret looks like a JWT access token (starts with 'eyJ')
            // If user provides an access token directly, use it (useful for testing)
            if (clientSecret.startsWith('eyJ') || clientSecret.length > 100) {
                console.log('Using provided access token directly');
                this.connected = true;
                return {
                    accessToken: clientSecret,
                    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                };
            }

            // Otherwise, try OAuth2 flow (requires authorization code)
            // Note: In a real app, you'd redirect user to Upstox login first to get the code
            console.log('Attempting OAuth2 token exchange...');
            const response = await this.apiClient.post('/login/authorization/token', {
                code: clientSecret, // This should be the authorization code from OAuth flow
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri || window.location.origin,
                grant_type: 'authorization_code',
            });

            this.connected = true;
            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresAt: Date.now() + (response.data.expires_in * 1000),
            };
        } catch (error: any) {
            console.error('Upstox authentication failed:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message || 'Authentication failed';
            throw new Error(`Upstox: ${errorMsg}. Try using mock mode or a valid access token.`);
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<BrokerAuthResponse> {
        try {
            const response = await this.apiClient.post('/login/authorization/token', {
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            });

            return {
                accessToken: response.data.access_token,
                expiresAt: Date.now() + (response.data.expires_in * 1000),
            };
        } catch (error: any) {
            console.error('Upstox token refresh failed:', error.response?.data || error.message);
            throw new Error('Failed to refresh Upstox access token');
        }
    }

    async fetchHoldings(accessToken: string): Promise<InvestmentHolding[]> {
        try {
            const allHoldings: InvestmentHolding[] = [];

            // Fetch long-term holdings (stocks, ETFs)
            try {
                console.log('Fetching long-term holdings from Upstox...');
                const holdingsResponse = await this.apiClient.get('/portfolio/long-term-holdings', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/json',
                    },
                });

                console.log('Long-term holdings response:', holdingsResponse.data);

                if (holdingsResponse.data?.data && Array.isArray(holdingsResponse.data.data)) {
                    const holdings = holdingsResponse.data.data.map((holding: any) => {
                        console.log('Processing holding:', holding);
                        return {
                            id: crypto.randomUUID(),
                            name: holding.tradingsymbol || holding.trading_symbol || holding.company_name || holding.instrument_token || 'Unknown',
                            type: this.mapInstrumentType(holding.instrument_type || holding.product || 'equity'),
                            quantity: parseInt(holding.quantity) || 0,
                            avgPrice: parseFloat(holding.average_price || holding.avg_price || holding.buy_price || holding.avg_cost || 0),
                            currentPrice: parseFloat(holding.last_price || holding.close_price || holding.ltp || holding.current_price || 0),
                            brokerId: 'upstox' as const,
                        };
                    });
                    console.log(`Found ${holdings.length} long-term holdings`);
                    allHoldings.push(...holdings);
                }
            } catch (error: any) {
                console.error('Could not fetch long-term holdings:', error.response?.data || error.message);
            }

            // Fetch current positions (intraday + delivery)
            try {
                console.log('Fetching short-term positions from Upstox...');
                const positionsResponse = await this.apiClient.get('/portfolio/short-term-positions', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/json',
                    },
                });

                console.log('Short-term positions response:', positionsResponse.data);

                if (positionsResponse.data?.data && Array.isArray(positionsResponse.data.data)) {
                    const positions = positionsResponse.data.data
                        .filter((pos: any) => (pos.quantity || pos.buy_quantity || 0) > 0)
                        .map((pos: any) => {
                            console.log('Processing position:', pos);
                            return {
                                id: crypto.randomUUID(),
                                name: pos.tradingsymbol || pos.trading_symbol || pos.instrument_token || 'Unknown',
                                type: this.mapInstrumentType(pos.instrument_type || pos.product || 'equity'),
                                quantity: parseInt(pos.quantity || pos.buy_quantity || 0),
                                avgPrice: parseFloat(pos.average_price || pos.avg_price || pos.buy_price || 0),
                                currentPrice: parseFloat(pos.last_price || pos.close_price || pos.ltp || 0),
                                brokerId: 'upstox' as const,
                            };
                        });
                    console.log(`Found ${positions.length} short-term positions`);
                    allHoldings.push(...positions);
                }
            } catch (error: any) {
                console.error('Could not fetch positions:', error.response?.data || error.message);
            }

            // Try alternative endpoint: Get holdings (v2 unified endpoint)
            try {
                console.log('Trying alternative holdings endpoint...');
                const altResponse = await this.apiClient.get('/portfolio/holdings', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/json',
                    },
                });

                console.log('Alternative holdings response:', altResponse.data);

                if (altResponse.data?.data && Array.isArray(altResponse.data.data)) {
                    const altHoldings = altResponse.data.data.map((holding: any) => {
                        console.log('Processing alternative holding:', holding);
                        return {
                            id: crypto.randomUUID(),
                            name: holding.tradingsymbol || holding.trading_symbol || holding.instrument_token || 'Unknown',
                            type: this.mapInstrumentType(holding.instrument_type || holding.product || 'equity'),
                            quantity: parseInt(holding.quantity) || 0,
                            avgPrice: parseFloat(holding.average_price || holding.avg_price || holding.buy_price || 0),
                            currentPrice: parseFloat(holding.last_price || holding.close_price || holding.ltp || 0),
                            brokerId: 'upstox' as const,
                        };
                    });
                    console.log(`Found ${altHoldings.length} holdings from alternative endpoint`);
                    allHoldings.push(...altHoldings);
                }
            } catch (error: any) {
                console.error('Alternative endpoint not available:', error.response?.data || error.message);
            }

            // Remove duplicates based on symbol name
            const uniqueHoldings = Array.from(
                new Map(allHoldings.map(h => [h.name, h])).values()
            );

            console.log(`Total unique holdings: ${uniqueHoldings.length}`);
            console.log('All holdings:', uniqueHoldings);

            if (uniqueHoldings.length === 0) {
                console.warn('No holdings found. This could mean:');
                console.warn('1. You have no holdings in your Upstox account');
                console.warn('2. The API endpoints have changed');
                console.warn('3. The access token lacks required permissions');
            }

            return uniqueHoldings;

        } catch (error: any) {
            console.error('Failed to fetch Upstox holdings:', error.response?.data || error.message);
            throw new Error('Failed to fetch holdings from Upstox');
        }
    }

    private mapInstrumentType(instrumentType: string): InvestmentType {
        // Map Upstox instrument types to our investment types
        const type = instrumentType?.toLowerCase() || '';
        
        if (type.includes('etf')) {
            return InvestmentType.ETF;
        }
        if (type.includes('mutual') || type.includes('mf') || type === 'mf') {
            return InvestmentType.MUTUAL_FUND;
        }
        // Default to stock for equity, options, futures, etc.
        return InvestmentType.STOCK;
    }

    isConnected(): boolean {
        return this.connected;
    }
}

/**
 * AngelOne (Angel Broking) implementation
 * API Docs: https://smartapi.angelbroking.com/docs
 */
export class AngelOneBrokerService implements IBrokerService {
    private readonly baseUrl = 'https://apiconnect.angelbroking.com';
    private apiClient: AxiosInstance;
    private connected = false;

    constructor() {
        this.apiClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }

    async authenticate(clientId: string, clientSecret: string): Promise<BrokerAuthResponse> {
        try {
            const response = await this.apiClient.post('/rest/auth/angelbroking/user/v1/loginByPassword', {
                clientcode: clientId,
                password: clientSecret,
            });

            this.connected = true;
            return {
                accessToken: response.data.data.jwtToken,
                refreshToken: response.data.data.refreshToken,
            };
        } catch (error: any) {
            console.error('AngelOne authentication failed:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with AngelOne');
        }
    }

    async fetchHoldings(accessToken: string): Promise<InvestmentHolding[]> {
        try {
            const response = await this.apiClient.get('/rest/secure/angelbroking/portfolio/v1/getHolding', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'X-UserType': 'USER',
                    'X-SourceID': 'WEB',
                },
            });

            return response.data.data.holdings.map((holding: any) => ({
                id: crypto.randomUUID(),
                name: holding.tradingsymbol,
                type: this.mapInstrumentType(holding.product),
                quantity: holding.quantity,
                avgPrice: holding.averageprice,
                currentPrice: holding.ltp,
                brokerId: 'angelone' as const,
            }));
        } catch (error: any) {
            console.error('Failed to fetch AngelOne holdings:', error.response?.data || error.message);
            throw new Error('Failed to fetch holdings from AngelOne');
        }
    }

    private mapInstrumentType(product: string): InvestmentType {
        switch (product?.toLowerCase()) {
            case 'etf':
                return InvestmentType.ETF;
            case 'mutual_fund':
            case 'mf':
                return InvestmentType.MUTUAL_FUND;
            default:
                return InvestmentType.STOCK;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }
}

/**
 * Fyers broker implementation
 * API Docs: https://api-docs.fyers.in/
 */
export class FyersBrokerService implements IBrokerService {
    private readonly baseUrl = 'https://api.fyers.in/api/v2';
    private apiClient: AxiosInstance;
    private connected = false;

    constructor() {
        this.apiClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }

    async authenticate(clientId: string, clientSecret: string, redirectUri?: string): Promise<BrokerAuthResponse> {
        try {
            // Fyers uses OAuth2 flow
            const response = await this.apiClient.post('/validate-authcode', {
                grant_type: 'authorization_code',
                appIdHash: clientId,
                code: clientSecret, // This should be the auth code from OAuth flow
            });

            this.connected = true;
            return {
                accessToken: response.data.access_token,
            };
        } catch (error: any) {
            console.error('Fyers authentication failed:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Fyers');
        }
    }

    async fetchHoldings(accessToken: string): Promise<InvestmentHolding[]> {
        try {
            const response = await this.apiClient.get('/holdings', {
                headers: {
                    'Authorization': `${accessToken}`,
                },
            });

            return response.data.holdings.map((holding: any) => ({
                id: crypto.randomUUID(),
                name: holding.symbol,
                type: this.mapInstrumentType(holding.segment),
                quantity: holding.quantity,
                avgPrice: holding.costPrice,
                currentPrice: holding.ltp,
                brokerId: 'fyers' as const,
            }));
        } catch (error: any) {
            console.error('Failed to fetch Fyers holdings:', error.response?.data || error.message);
            throw new Error('Failed to fetch holdings from Fyers');
        }
    }

    private mapInstrumentType(segment: string): InvestmentType {
        switch (segment?.toLowerCase()) {
            case 'etf':
                return InvestmentType.ETF;
            case 'mf':
            case 'mutual_fund':
                return InvestmentType.MUTUAL_FUND;
            default:
                return InvestmentType.STOCK;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }
}

/**
 * Mock broker service for development/testing
 */
export class MockBrokerService implements IBrokerService {
    private connected = false;

    async authenticate(clientId: string, clientSecret: string): Promise<BrokerAuthResponse> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (clientId && clientSecret) {
            this.connected = true;
            return {
                accessToken: 'mock-access-token-' + Date.now(),
                refreshToken: 'mock-refresh-token',
                expiresAt: Date.now() + 3600000, // 1 hour
            };
        }
        throw new Error('Invalid credentials');
    }

    async fetchHoldings(accessToken: string): Promise<InvestmentHolding[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return mock data
        return [
            {
                id: crypto.randomUUID(),
                name: 'RELIANCE',
                type: InvestmentType.STOCK,
                quantity: 10,
                avgPrice: 2450.50,
                currentPrice: 2500.00,
                brokerId: 'upstox',
            },
            {
                id: crypto.randomUUID(),
                name: 'NIFTYBEES',
                type: InvestmentType.ETF,
                quantity: 50,
                avgPrice: 220.00,
                currentPrice: 225.50,
                brokerId: 'upstox',
            },
            {
                id: crypto.randomUUID(),
                name: 'AXISGROWTH',
                type: InvestmentType.MUTUAL_FUND,
                quantity: 100,
                avgPrice: 45.30,
                currentPrice: 48.75,
                brokerId: 'upstox',
            },
        ];
    }

    isConnected(): boolean {
        return this.connected;
    }
}

/**
 * Factory function to create appropriate broker service
 */
export function createBrokerService(brokerId: 'upstox' | 'angelone' | 'fyers', useMock = false): IBrokerService {
    // Check if we should use mock in development
    const shouldUseMock = useMock || 
        (typeof import.meta !== 'undefined' && 
         (import.meta as any).env?.VITE_USE_MOCK_BROKER === 'true');
    
    if (shouldUseMock) {
        return new MockBrokerService();
    }

    switch (brokerId) {
        case 'upstox':
            return new UpstoxBrokerService();
        case 'angelone':
            return new AngelOneBrokerService();
        case 'fyers':
            return new FyersBrokerService();
        default:
            throw new Error(`Unknown broker: ${brokerId}`);
    }
}
