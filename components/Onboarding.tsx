import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { AppData, TransactionType } from '../types';

const Onboarding: React.FC = () => {
    const [step, setStep] = useState(1);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [initialBalance, setInitialBalance] = useState('');
    const [age, setAge] = useState('');
    const { completeOnboarding } = useAppContext();

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (pin.length < 4) {
            alert('PIN must be at least 4 characters.');
            return;
        }
        if (pin !== confirmPin) {
            alert('PINs do not match.');
            return;
        }

        const data: AppData = {
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
            userProfile: { age: age ? parseInt(age, 10) : null },
            chatHistory: [],
        };

        if (parseFloat(initialBalance) > 0) {
            data.transactions.push({
                id: new Date().toISOString(),
                type: TransactionType.INCOME,
                category: 'Initial Balance',
                amount: parseFloat(initialBalance),
                date: new Date().toISOString(),
                description: 'Starting cash balance'
            });
        }

        await completeOnboarding(data, pin, age ? parseInt(age, 10) : null);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold">Welcome to Charan's Wealth Tracker</h2>
                        <p className="text-gray-600 dark:text-gray-400">Your personal, private, and powerful finance tracker. Let's get you set up in a few simple steps.</p>
                        <button onClick={handleNext} className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                            Get Started
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">Your Starting Point</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center">What's your current cash balance? You can add other accounts later.</p>
                        <div>
                            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Cash Balance</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₹</span>
                                </div>
                                <input
                                    type="number"
                                    id="balance"
                                    value={initialBalance}
                                    onChange={(e) => setInitialBalance(e.target.value)}
                                    className="w-full pl-7 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <button onClick={handleBack} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg">Back</button>
                            <button onClick={handleNext} className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">Next</button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">A Little About You</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center">Your age helps our AI provide more personalized financial advice. This is optional.</p>
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Age</label>
                            <input
                                type="number"
                                id="age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="mt-1 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                                placeholder="e.g., 30"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button onClick={handleBack} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg">Back</button>
                            <button onClick={handleNext} className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">Next</button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">Secure Your Data</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center">Create a PIN to protect your financial data. This PIN is stored only on your device.</p>
                        <div>
                            <label className="block text-sm font-medium">Create PIN (min 4 digits)</label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="mt-1 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Confirm PIN</label>
                            <input
                                type="password"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                className="mt-1 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button onClick={handleBack} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg">Back</button>
                            <button onClick={handleSubmit} className="py-2 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">Finish Setup</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default Onboarding;