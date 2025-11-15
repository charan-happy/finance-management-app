import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Transaction, Debt, Goal, InvestmentWish, Budget, Broker, InvestmentHolding, ChatMessage } from '../types';

interface AppContextType extends AppData {
    isAuthenticated: boolean;
    isOnboarded: boolean;
    loading: boolean;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
    completeOnboarding: (data: AppData, pin: string, age: number | null) => Promise<void>;
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
    userProfile: { age: null },
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

    useEffect(() => {
        try {
            const savedData = localStorage.getItem('zenith-finance-data');
            const pinHash = localStorage.getItem('zenith-finance-pin');
            
            if (pinHash) {
                setIsOnboarded(true);
            }
            if (savedData) {
                setData(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateData = (newData: Partial<AppData>) => {
        const updatedData = { ...data, ...newData };
        setData(updatedData);
        localStorage.setItem('zenith-finance-data', JSON.stringify(updatedData));
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

    const completeOnboarding = async (initialData: AppData, pin: string, age: number | null) => {
        const pinHash = await hashPin(pin);
        localStorage.setItem('zenith-finance-pin', pinHash);
        const dataToSave = { 
            ...initialData, // Use the passed initialData
            userProfile: { age },
        };
        localStorage.setItem('zenith-finance-data', JSON.stringify(dataToSave));
        setData(dataToSave);
        setIsOnboarded(true);
        setIsAuthenticated(true);
    };

    const contextValue: AppContextType = {
        ...data,
        isAuthenticated,
        isOnboarded,
        loading,
        login,
        logout,
        completeOnboarding,
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