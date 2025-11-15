import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAppContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits.');
            return;
        }
        setLoading(true);
        const success = await login(pin);
        if (!success) {
            setError('Invalid PIN. Please try again.');
            setPin('');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                        Welcome Back to Charan's Wealth Tracker
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Enter your PIN to unlock your dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        maxLength={8}
                        className="w-full px-4 py-3 text-center text-2xl tracking-[1em] bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                        placeholder="••••"
                        autoFocus
                    />
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300"
                    >
                        {loading ? 'Unlocking...' : 'Unlock'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;