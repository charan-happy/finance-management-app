import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { AppData } from '../types';

const Onboarding: React.FC = () => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [age, setAge] = useState('');
    const { completeOnboarding } = useAppContext();

    const [nameError, setNameError] = useState('');
    const handleNext = () => {
        if (step === 2) {
            if (!name.trim() || name.trim().length < 2) {
                setNameError('Please enter your name (at least 2 characters)');
                return;
            }
            setNameError('');
        }
        setStep(s => s + 1);
    };
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
            userProfile: { 
                name: name.trim() || 'User',
                age: age ? parseInt(age, 10) : null 
            },
            chatHistory: [],
        };

    await completeOnboarding(data, pin, age ? parseInt(age, 10) : null, name.trim() || 'User');
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center space-y-8 animate-fadeIn">
                        {/* Hero Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-full shadow-2xl">
                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                                Welcome to Your
                            </h1>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Wealth Tracker
                            </h2>
                        </div>

                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                            Your personal, private, and powerful finance companion. Let's begin your journey to financial freedom.
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap justify-center gap-3 pt-4">
                            <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                                🔒 Secure
                            </span>
                            <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                                📊 Smart Analytics
                            </span>
                            <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                🚀 Easy to Use
                            </span>
                        </div>

                        <button 
                            onClick={handleNext} 
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
                        >
                            Get Started →
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-2xl shadow-xl">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>

                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Tell Us About You</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Let's personalize your experience with some basic information.
                            </p>
                        </div>


                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-6 py-4 text-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl outline-none transition-all shadow-sm focus:shadow-md"
                                    placeholder="e.g., John"
                                />
                                {nameError && <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>}
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    We'll use this to personalize your dashboard
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Your Age (Optional)
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full px-6 py-4 text-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl outline-none transition-all shadow-sm focus:shadow-md"
                                    placeholder="e.g., 30"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    This helps us provide age-appropriate financial advice
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button 
                                onClick={handleBack} 
                                className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                ← Back
                            </button>
                            <button 
                                onClick={handleNext} 
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl shadow-xl">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>

                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Secure Your Data</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Create a PIN to protect your financial information. Only you will have access.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Create PIN (minimum 4 characters)
                                </label>
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full px-6 py-4 text-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-xl outline-none transition-all shadow-sm focus:shadow-md font-mono tracking-wider"
                                    placeholder="••••"
                                    maxLength={8}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Confirm PIN
                                </label>
                                <input
                                    type="password"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value)}
                                    className="w-full px-6 py-4 text-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-xl outline-none transition-all shadow-sm focus:shadow-md font-mono tracking-wider"
                                    placeholder="••••"
                                    maxLength={8}
                                />
                            </div>

                            {/* Security Info */}
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-green-700 dark:text-green-300">
                                        <p className="font-semibold">Your PIN is encrypted and stored locally</p>
                                        <p className="text-xs mt-1">We never send your PIN to any server. It stays on your device only.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button 
                                onClick={handleBack} 
                                className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                ← Back
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            >
                                Complete Setup ✓
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Main Card */}
            <div className="relative w-full max-w-xl">
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Step {step} of 3</span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{Math.round((step / 3) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-700/50">
                    {renderStep()}
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        By continuing, you agree to our{' '}
                        <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default Onboarding;
