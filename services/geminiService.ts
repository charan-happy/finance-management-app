import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppData, ChatMessage } from "../types";

export const getFinancialAdvice = async (
    apiKey: string,
    history: ChatMessage[],
    message: string,
    financialData: AppData
): Promise<string> => {
    if (!apiKey) {
        throw new Error("API key is not set. Please add it in settings.");
    }
    
    // Check if online
    if (!navigator.onLine) {
        return "The AI assistant cannot function offline as it requires a connection to Google's AI services. Please check your internet connection and try again.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const financialContext = `
      Here is a summary of the user's financial situation (all data is private and for context only):
      - User's Age: ${financialData.userProfile.age ? financialData.userProfile.age : 'Not provided'}
      - Total Income (last 30 days): ₹${financialData.transactions.filter(t => t.type === 'income' && new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
      - Total Expenses (last 30 days): ₹${financialData.transactions.filter(t => t.type === 'expense' && new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
      - Number of Debts: ${financialData.debts.length}
      - Total Debt Amount: ₹${financialData.debts.reduce((acc, d) => acc + d.totalAmount, 0).toFixed(2)}
      - Number of Financial Goals: ${financialData.goals.length}
      - Total Goal Target: ₹${financialData.goals.reduce((acc, g) => acc + g.targetAmount, 0).toFixed(2)}
      - Total Saved for Goals: ₹${financialData.goals.reduce((acc, g) => acc + g.savedAmount, 0).toFixed(2)}
    `;

    const systemInstruction = `You are a helpful and friendly financial assistant for the Charan's Wealth Tracker app. 
    Your role is to provide insightful, safe, and actionable financial advice. 
    Your advice should be tailored based on the user's age if provided.
    Do not give specific investment advice (e.g., "buy this stock"). Instead, focus on principles of financial planning, budgeting, and goal setting.
    Use the provided financial context to tailor your responses.
    The user's previous conversation is provided. Now, answer the user's latest message.`;

    const contents = [
        ...history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        })),
        {
            role: 'user',
            parts: [{ text: `${financialContext}\n\nUser message: ${message}` }]
        }
    ];

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
             return "Error: The provided Gemini API key is not valid. Please check it in the settings.";
        }
        return "Sorry, I encountered an error while processing your request. Please try again.";
    }
};