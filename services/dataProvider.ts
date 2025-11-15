import { AppData } from '../types';

/**
 * Abstract interface for data persistence
 * Supports both local storage and remote database implementations
 */
export interface IDataProvider {
    initialize(): Promise<void>;
    loadData(userId: string): Promise<AppData | null>;
    saveData(userId: string, data: AppData): Promise<void>;
    isAvailable(): boolean;
}

/**
 * Local Storage implementation (for non-DB mode)
 */
export class LocalStorageProvider implements IDataProvider {
    private readonly STORAGE_KEY = 'zenith-finance-data';

    async initialize(): Promise<void> {
        // No initialization needed for localStorage
        return Promise.resolve();
    }

    async loadData(userId: string): Promise<AppData | null> {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (savedData) {
                return JSON.parse(savedData);
            }
            return null;
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
            return null;
        }
    }

    async saveData(userId: string, data: AppData): Promise<void> {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
            throw error;
        }
    }

    isAvailable(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }
}

/**
 * Neon.tech (PostgreSQL) implementation
 */
export class NeonDatabaseProvider implements IDataProvider {
    private connectionString: string;
    private initialized = false;

    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Import dynamically to avoid bundling issues
            const { neon } = await import('@neondatabase/serverless');
            const sql = neon(this.connectionString);

            // Create table if not exists
            await sql`
                CREATE TABLE IF NOT EXISTS user_data (
                    user_id VARCHAR(255) PRIMARY KEY,
                    data JSONB NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Create index for better performance
            await sql`
                CREATE INDEX IF NOT EXISTS idx_user_data_updated 
                ON user_data(updated_at)
            `;

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    async loadData(userId: string): Promise<AppData | null> {
        try {
            const { neon } = await import('@neondatabase/serverless');
            const sql = neon(this.connectionString);

            const result = await sql`
                SELECT data FROM user_data WHERE user_id = ${userId}
            `;

            if (result.length > 0) {
                return result[0].data as AppData;
            }
            return null;
        } catch (error) {
            console.error('Failed to load data from database:', error);
            return null;
        }
    }

    async saveData(userId: string, data: AppData): Promise<void> {
        try {
            const { neon } = await import('@neondatabase/serverless');
            const sql = neon(this.connectionString);

            await sql`
                INSERT INTO user_data (user_id, data, updated_at)
                VALUES (${userId}, ${JSON.stringify(data)}, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id)
                DO UPDATE SET 
                    data = ${JSON.stringify(data)},
                    updated_at = CURRENT_TIMESTAMP
            `;
        } catch (error) {
            console.error('Failed to save data to database:', error);
            throw error;
        }
    }

    isAvailable(): boolean {
        return !!this.connectionString;
    }
}

/**
 * Hybrid provider that uses database when available, falls back to localStorage
 */
export class HybridDataProvider implements IDataProvider {
    private primaryProvider: IDataProvider;
    private fallbackProvider: IDataProvider;

    constructor(primaryProvider: IDataProvider, fallbackProvider: IDataProvider) {
        this.primaryProvider = primaryProvider;
        this.fallbackProvider = fallbackProvider;
    }

    async initialize(): Promise<void> {
        try {
            if (this.primaryProvider.isAvailable()) {
                await this.primaryProvider.initialize();
            }
        } catch (error) {
            console.warn('Primary provider initialization failed, using fallback:', error);
        }
    }

    async loadData(userId: string): Promise<AppData | null> {
        try {
            if (this.primaryProvider.isAvailable()) {
                const data = await this.primaryProvider.loadData(userId);
                if (data) return data;
            }
        } catch (error) {
            console.warn('Primary provider load failed, trying fallback:', error);
        }

        return this.fallbackProvider.loadData(userId);
    }

    async saveData(userId: string, data: AppData): Promise<void> {
        // Save to both providers for redundancy
        const promises: Promise<void>[] = [];

        if (this.primaryProvider.isAvailable()) {
            promises.push(
                this.primaryProvider.saveData(userId, data).catch(error => {
                    console.error('Primary provider save failed:', error);
                })
            );
        }

        if (this.fallbackProvider.isAvailable()) {
            promises.push(
                this.fallbackProvider.saveData(userId, data).catch(error => {
                    console.error('Fallback provider save failed:', error);
                })
            );
        }

        await Promise.all(promises);
    }

    isAvailable(): boolean {
        return this.primaryProvider.isAvailable() || this.fallbackProvider.isAvailable();
    }
}

/**
 * Factory function to create appropriate data provider based on configuration
 */
export function createDataProvider(config?: { 
    databaseUrl?: string; 
    mode?: 'db' | 'local' | 'hybrid' 
}): IDataProvider {
    const mode = config?.mode || (config?.databaseUrl ? 'hybrid' : 'local');

    switch (mode) {
        case 'db':
            if (!config?.databaseUrl) {
                throw new Error('Database URL is required for DB mode');
            }
            return new NeonDatabaseProvider(config.databaseUrl);
        
        case 'local':
            return new LocalStorageProvider();
        
        case 'hybrid':
        default:
            const dbProvider = config?.databaseUrl 
                ? new NeonDatabaseProvider(config.databaseUrl)
                : new LocalStorageProvider();
            const localProvider = new LocalStorageProvider();
            return new HybridDataProvider(dbProvider, localProvider);
    }
}
