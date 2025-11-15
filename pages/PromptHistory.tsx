import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625v2.625a2.625 2.625 0 11-5.25 0v-2.625m0-8.25v2.625a2.625 2.625 0 105.25 0V6.375" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const PromptHistory: React.FC = () => {
    const { chatHistory } = useAppContext();
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

    const userPrompts = (chatHistory || []).filter(msg => msg.role === 'user');

    const handleCopyPrompt = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedPrompt(id);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">AI Assistant Prompt History</h1>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
                    {userPrompts.length > 0 ? (
                        [...userPrompts].reverse().map((prompt, index) => (
                            <div key={index} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-gray-800 dark:text-gray-200">{prompt.text}</p>
                                <button
                                    onClick={() => handleCopyPrompt(prompt.text, `prompt-${index}`)}
                                    className="ml-4 p-2 text-gray-500 hover:text-indigo-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                                    aria-label="Copy prompt"
                                >
                                    {copiedPrompt === `prompt-${index}` ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No user prompts found in your history.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromptHistory;