
export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

export interface Transaction {
    id: string;
    type: TransactionType;
    category: string;
    amount: number;
    date: string; // ISO string
    description: string;
    isRecurring?: boolean;
}

export interface Debt {
    id: string;
    name: string;
    totalAmount: number;
    amountPaid: number;
    monthlyPayment: number;
    dueDate: number; // Day of the month
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    targetDate: string; // ISO string
}

export enum InvestmentType {
    STOCK = 'Stock',
    ETF = 'ETF',
    MUTUAL_FUND = 'Mutual Fund'
}

export interface InvestmentWish {
    id:string;
    name: string;
    type: InvestmentType;
    targetQuantity: number;
    targetPrice: number;
    broker: string;
}

export interface InvestmentHolding {
    id: string;
    name: string;
    type: InvestmentType;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    brokerId: 'upstox' | 'angelone' | 'fyers';
}

export interface Budget {
    id: string;
    category: string;
    amount: number;
}

export interface Broker {
    id: 'upstox' | 'angelone' | 'fyers';
    name: string;
    clientId: string;
    clientSecret: string;
    isConnected: boolean;
}

export interface UserProfile {
    name: string;
    age: number | null;
}

export interface AuthInfo {
    recoveryHash: string | null;
}

export interface AppData {
    transactions: Transaction[];
    debts: Debt[];
    goals: Goal[];
    investmentWishlist: InvestmentWish[];
    investmentHoldings: InvestmentHolding[];
    budgets: Budget[];
    brokers: Broker[];
    geminiApiKey: string;
    userProfile: UserProfile;
    auth: AuthInfo;
    chatHistory: ChatMessage[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}