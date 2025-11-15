
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getFinancialAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SendIcon, AssistantIcon } from '../components/Icons';
import Markdown from 'react-markdown';

const Assistant: React.FC = () => {
    const appData = useAppContext();
    const { geminiApiKey, chatHistory, updateData } = appData;
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [chatHistory]);
    
    const updateChatHistory = (history: ChatMessage[]) => {
        updateData({ chatHistory: history });
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        const previousHistory = chatHistory || [];
        
        // Update UI with user's message immediately
        updateChatHistory([...previousHistory, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const modelResponse = await getFinancialAdvice(geminiApiKey, previousHistory, input, appData);
            const modelMessage: ChatMessage = { role: 'model', text: modelResponse };
            updateChatHistory([...previousHistory, userMessage, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', text: error instanceof Error ? error.message : 'An unknown error occurred.' };
            updateChatHistory([...previousHistory, userMessage, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">AI Financial Assistant</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(!chatHistory || chatHistory.length === 0) && (
                     <div className="text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
                        <AssistantIcon className="w-16 h-16 mb-4 text-indigo-400" />
                        <p className="font-semibold">Hello! How can I help with your finances today?</p>
                        <p className="text-sm mt-1">e.g., "How can I save more money?" or "Explain my debt situation."</p>
                        {!geminiApiKey && <p className="mt-4 text-sm text-yellow-500">Please add your Gemini API Key in Settings to enable the assistant.</p>}
                    </div>
                )}
                {(chatHistory || []).map((msg, index) => (
                    <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                           <div className="prose prose-sm dark:prose-invert max-w-none">
                             <Markdown>{msg.text}</Markdown>
                           </div>
                        </div>
                    </div>
                ))}
                 {loading && (
                    <div className="flex justify-start gap-4">
                        <div className="max-w-xl p-4 rounded-2xl bg-gray-200 dark:bg-gray-700">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={geminiApiKey ? "Ask a financial question..." : "Add Gemini API key in settings..."}
                        disabled={loading || !geminiApiKey}
                        className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-700 rounded-full outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button onClick={handleSend} disabled={loading || !input.trim() || !geminiApiKey} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <SendIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Assistant;