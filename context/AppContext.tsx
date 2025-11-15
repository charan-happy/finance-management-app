import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Transaction, Debt, Goal, InvestmentWish, Budget, Broker, InvestmentHolding, ChatMessage } from '../types';
import { createDataProvider, IDataProvider } from '../services/dataProvider';
import { config } from '../services/config';

interface AppContextType extends AppData {
    isAuthenticated: boolean;
    isOnboarded: boolean;
    loading: boolean;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
    changePin: (oldPin: string, newPin: string) => Promise<boolean>;
    resetApp: () => Promise<void>;
    completeOnboarding: (data: AppData, pin: string, age: number | null, name: string, recoveryKey: string) => Promise<void>;
    resetPinWithRecoveryKey: (recoveryKey: string, newPin: string) => Promise<boolean>;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    updateTransaction: (transaction: Transaction) => void;
    deleteTransaction: (transactionId: string) => void;
    addDebt: (debt: Omit<Debt, 'id'>) => void;
    updateDebt: (debt: Debt) => void;
    deleteDebt: (debtId: string) => void;
    addGoal: (goal: Omit<Goal, 'id'>) => void;
    updateGoal: (goal: Goal) => void;
    deleteGoal: (goalId: string) => void;
    addInvestmentWish: (wish: Omit<InvestmentWish, 'id'>) => void;
    addInvestmentHolding: (holding: Omit<InvestmentHolding, 'id'>) => void;
    addMultipleInvestmentHoldings: (holdings: Omit<InvestmentHolding, 'id'>[], brokerId?: string) => void;
    addBudget: (budget: Omit<Budget, 'id'>) => void;
    updateBudget: (budget: Budget) => void;
    deleteBudget: (budgetId: string) => void;
    updateData: (data: Partial<AppData>) => void;
    updateBrokerConnection: (id: Broker['id'], clientId: string, clientSecret: string, isConnected: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialData: AppData = {
    transactions: [],
    debts: [],
    goals: [],
    investmentWishlist: [],
    investmentHoldings: [],
    budgets: [],
    brokers: [
        { id: 'upstox', name: 'Upstox', clientId: '', clientSecret: '', isConnected: false },
        { id: 'angelone', name: 'AngelOne', clientId: '', clientSecret: '', isConnected: false },
        { id: 'fyers', name: 'Fyers', clientId: '', clientSecret: '', isConnected: false },
    ],
    geminiApiKey: '',
    userProfile: { name: 'User', age: null },
    auth: { recoveryHash: null },
    chatHistory: [],
};

async function hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData>(initialData);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [dataProvider] = useState<IDataProvider>(() => 
        createDataProvider({
            databaseUrl: config.databaseUrl,
            mode: config.dataMode,
        })
    );
    const [userId] = useState<string>(() => {
        // Get or create a unique user ID
        let id = localStorage.getItem('zenith-user-id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('zenith-user-id', id);
        }
        return id;
    });

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Initialize the data provider
                await dataProvider.initialize();
                
                // Check if user is onboarded
                const pinHash = localStorage.getItem('zenith-finance-pin');
                if (pinHash) {
                    setIsOnboarded(true);
                }
                
                // Load data from provider
                const savedData = await dataProvider.loadData(userId);
                if (savedData) {
                    // Check and update broker connection status based on stored tokens
                    const updatedBrokers = savedData.brokers.map(broker => {
                        const hasToken = !!localStorage.getItem(`${broker.id}-access-token`);
                        let clientId = broker.clientId;
                        let clientSecret = broker.clientSecret;
                        
                        // Load credentials from environment variables if not in saved data
                        if (!clientId || !clientSecret) {
                            if (broker.id === 'upstox') {
                                clientId = config.upstox.clientId || '';
                                clientSecret = config.upstox.clientSecret || '';
                            } else if (broker.id === 'angelone') {
                                clientId = config.angelone.clientId || '';
                                clientSecret = config.angelone.clientSecret || '';
                            } else if (broker.id === 'fyers') {
                                clientId = config.fyers.clientId || '';
                                clientSecret = config.fyers.clientSecret || '';
                            }
                        }
                        
                        // Mark as connected if we have both credentials and an access token
                        const isConnected = hasToken && !!clientId && !!clientSecret;
                        
                        return {
                            ...broker,
                            clientId,
                            clientSecret,
                            isConnected
                        };
                    });
                    
                    setData({ ...savedData, brokers: updatedBrokers });
                } else {
                    // Initialize broker credentials from environment variables
                    const updatedBrokers = initialData.brokers.map(broker => {
                        const hasToken = !!localStorage.getItem(`${broker.id}-access-token`);
                        let clientId = '';
                        let clientSecret = '';
                        
                        // Load credentials from environment variables
                        if (broker.id === 'upstox') {
                            clientId = config.upstox.clientId || '';
                            clientSecret = config.upstox.clientSecret || '';
                        } else if (broker.id === 'angelone') {
                            clientId = config.angelone.clientId || '';
                            clientSecret = config.angelone.clientSecret || '';
                        } else if (broker.id === 'fyers') {
                            clientId = config.fyers.clientId || '';
                            clientSecret = config.fyers.clientSecret || '';
                        }
                        
                        // Mark as connected if we have both credentials and an access token
                        const isConnected = hasToken && !!clientId && !!clientSecret;
                        
                        return {
                            ...broker,
                            clientId,
                            clientSecret,
                            isConnected
                        };
                    });
                    
                    setData({ ...initialData, brokers: updatedBrokers });
                }
            } catch (error) {
                console.error("Failed to initialize app", error);
            } finally {
                setLoading(false);
            }
        };

        initializeApp();
    }, [dataProvider, userId]);

    const updateData = async (newData: Partial<AppData>) => {
        const updatedData = { ...data, ...newData };
        setData(updatedData);
        
        // Save to data provider (async, non-blocking)
        dataProvider.saveData(userId, updatedData).catch(error => {
            console.error('Failed to save data:', error);
        });
    };

    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            ...transaction,
        };
        updateData({ transactions: [...data.transactions, newTransaction] });
    };

    const updateTransaction = (updatedTransaction: Transaction) => {
        const newTransactions = data.transactions.map(t =>
            t.id === updatedTransaction.id ? updatedTransaction : t
        );
        updateData({ transactions: newTransactions });
    };

    const deleteTransaction = (transactionId: string) => {
        const newTransactions = data.transactions.filter(t => t.id !== transactionId);
        updateData({ transactions: newTransactions });
    };

    const addDebt = (debt: Omit<Debt, 'id'>) => {
        const newDebt: Debt = { id: crypto.randomUUID(), ...debt };
        updateData({ debts: [...data.debts, newDebt] });
    };
    
    const updateDebt = (updatedDebt: Debt) => {
        const newDebts = data.debts.map(d =>
            d.id === updatedDebt.id ? updatedDebt : d
        );
        updateData({ debts: newDebts });
    };

    const deleteDebt = (debtId: string) => {
        const newDebts = data.debts.filter(d => d.id !== debtId);
        updateData({ debts: newDebts });
    };

    const addGoal = (goal: Omit<Goal, 'id'>) => {
        const newGoal: Goal = { id: crypto.randomUUID(), ...goal };
        updateData({ goals: [...data.goals, newGoal] });
    };
    
    const updateGoal = (updatedGoal: Goal) => {
        const newGoals = data.goals.map(g =>
            g.id === updatedGoal.id ? updatedGoal : g
        );
        updateData({ goals: newGoals });
    };

    const deleteGoal = (goalId: string) => {
        const newGoals = data.goals.filter(g => g.id !== goalId);
        updateData({ goals: newGoals });
    };

    const addInvestmentWish = (wish: Omit<InvestmentWish, 'id'>) => {
        const newWish: InvestmentWish = { id: crypto.randomUUID(), ...wish };
        updateData({ investmentWishlist: [...data.investmentWishlist, newWish] });
    };

    const addInvestmentHolding = (holding: Omit<InvestmentHolding, 'id'>) => {
        const newHolding: InvestmentHolding = { id: crypto.randomUUID(), ...holding };
        updateData({ investmentHoldings: [...data.investmentHoldings, newHolding] });
    };

    const addMultipleInvestmentHoldings = (holdings: Omit<InvestmentHolding, 'id'>[], brokerId?: string) => {
        // Remove existing holdings from this broker to avoid duplicates
        const filteredHoldings = brokerId 
            ? data.investmentHoldings.filter(h => h.brokerId !== brokerId)
            : data.investmentHoldings;
            
        const newHoldings: InvestmentHolding[] = holdings.map(holding => ({
            id: crypto.randomUUID(),
            ...holding
        }));
        updateData({ investmentHoldings: [...filteredHoldings, ...newHoldings] });
    };

    const addBudget = (budget: Omit<Budget, 'id'>) => {
        const newBudget: Budget = { id: crypto.randomUUID(), ...budget };
        updateData({ budgets: [...data.budgets, newBudget] });
    };

    const updateBudget = (updatedBudget: Budget) => {
        const newBudgets = data.budgets.map(b =>
            b.id === updatedBudget.id ? updatedBudget : b
        );
        updateData({ budgets: newBudgets });
    };

    const deleteBudget = (budgetId: string) => {
        const newBudgets = data.budgets.filter(b => b.id !== budgetId);
        updateData({ budgets: newBudgets });
    };

    const updateBrokerConnection = (id: Broker['id'], clientId: string, clientSecret: string, isConnected: boolean) => {
        const newBrokers = data.brokers.map(b => 
            b.id === id ? { ...b, clientId, clientSecret, isConnected } : b
        );
        updateData({ brokers: newBrokers });
    };

    const login = async (pin: string): Promise<boolean> => {
        const savedPinHash = localStorage.getItem('zenith-finance-pin');
        if (!savedPinHash) return false;
        const enteredPinHash = await hashPin(pin);
        if (enteredPinHash === savedPinHash) {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    const changePin = async (oldPin: string, newPin: string): Promise<boolean> => {
        // Verify old PIN first
        const oldPinHash = await hashPin(oldPin);
        const storedHash = localStorage.getItem('zenith-finance-pin');
        
        if (oldPinHash !== storedHash) {
            return false; // Old PIN doesn't match
        }
        
        // Set new PIN
        const newPinHash = await hashPin(newPin);
        localStorage.setItem('zenith-finance-pin', newPinHash);
        return true;
    };

    const resetApp = async () => {
        // Clear all localStorage data
        localStorage.removeItem('zenith-finance-pin');
        localStorage.removeItem('zenith-finance-onboarded');
    localStorage.removeItem('zenith-finance-user-id');
    localStorage.removeItem('zenith-user-id');
        localStorage.removeItem('zenith-finance-data');
        
        // Clear database data
        try {
            const emptyData: AppData = {
                transactions: [],
                debts: [],
                goals: [],
                investmentWishlist: [],
                investmentHoldings: [],
                budgets: [],
                brokers: [],
                geminiApiKey: '',
                userProfile: { name: 'User', age: null },
                auth: { recoveryHash: null },
                chatHistory: [],
            };
            await dataProvider.saveData(userId, emptyData);
        } catch (error) {
            console.error('Error clearing database:', error);
        }
        
        // Reset state
        setIsAuthenticated(false);
        setIsOnboarded(false);
        setData({
            transactions: [],
            debts: [],
            goals: [],
            investmentWishlist: [],
            investmentHoldings: [],
            budgets: [],
            brokers: [],
            geminiApiKey: '',
            userProfile: { name: 'User', age: null },
            auth: { recoveryHash: null },
            chatHistory: [],
        });
        
        // Reload the page to restart the app
        window.location.reload();
    };

    const completeOnboarding = async (initialData: AppData, pin: string, age: number | null, name: string, recoveryKey: string) => {
        const pinHash = await hashPin(pin);
        localStorage.setItem('zenith-finance-pin', pinHash);
        const recoveryHash = await hashPin(recoveryKey);
        localStorage.setItem('zenith-recovery-hash', recoveryHash);
        const dataToSave = { 
            ...initialData,
            userProfile: { name, age },
            auth: { recoveryHash },
        };
        
        // Save to data provider
        await dataProvider.saveData(userId, dataToSave);
        
        setData(dataToSave);
        setIsOnboarded(true);
        setIsAuthenticated(true);
    };

    const resetPinWithRecoveryKey = async (recoveryKey: string, newPin: string): Promise<boolean> => {
        const providedHash = await hashPin(recoveryKey);
        const localRecovery = localStorage.getItem('zenith-recovery-hash');
        const savedRecovery = data.auth?.recoveryHash || null;
        const matches = (localRecovery && localRecovery === providedHash) || (savedRecovery && savedRecovery === providedHash);
        if (!matches) return false;
        const newPinHash = await hashPin(newPin);
        localStorage.setItem('zenith-finance-pin', newPinHash);
        setIsAuthenticated(true);
        return true;
    };

    const contextValue: AppContextType = {
        ...data,
        isAuthenticated,
        isOnboarded,
        loading,
        login,
        logout,
        changePin,
        resetApp,
        completeOnboarding,
        resetPinWithRecoveryKey,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addDebt,
        updateDebt,
        deleteDebt,
        addGoal,
        updateGoal,
        deleteGoal,
        addInvestmentWish,
        addInvestmentHolding,
        addMultipleInvestmentHoldings,
        addBudget,
        updateBudget,
        deleteBudget,
        updateData,
        updateBrokerConnection,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};