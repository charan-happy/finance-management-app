import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showRecoveryReset, setShowRecoveryReset] = useState(false);
    const [recoveryKey, setRecoveryKey] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [showNewPin, setShowNewPin] = useState(false);
    const [showConfirmNewPin, setShowConfirmNewPin] = useState(false);
    const [recoveryError, setRecoveryError] = useState('');
    const [recoveryAttempts, setRecoveryAttempts] = useState(0);
    const [cooldownMs, setCooldownMs] = useState(0);
    const { login, resetApp, resetPinWithRecoveryKey, userProfile } = useAppContext();

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

    const handleResetConfirm = async () => {
        setLoading(true);
        await resetApp();
        // resetApp will reload the page, so no need for additional cleanup
    };

    const handleRecoveryReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setRecoveryError('');
        if (cooldownMs > 0) return; // ignore submissions during cooldown
        if (!recoveryKey.trim()) {
            setRecoveryError('Recovery key is required.');
            return;
        }
        if (newPin.length < 4) {
            setRecoveryError('New PIN must be at least 4 digits.');
            return;
        }
        if (newPin !== confirmNewPin) {
            setRecoveryError('PINs do not match.');
            return;
        }
        setLoading(true);
        const ok = await resetPinWithRecoveryKey(recoveryKey.trim(), newPin);
        if (!ok) {
            setRecoveryError('Invalid recovery key. Please check and try again.');
            const nextAttempts = recoveryAttempts + 1;
            setRecoveryAttempts(nextAttempts);
            setCooldownMs(Math.min(5000, nextAttempts * 1000));
            setLoading(false);
            return;
        }
        // On success, set a flash message and context authenticates the user; app will proceed
        try {
            localStorage.setItem('zenith-flash', "PIN reset successfully. Welcome back!");
        } catch {}
        setLoading(false);
    };

    // Cooldown countdown timer
    useEffect(() => {
        if (cooldownMs <= 0) return;
        const id = setInterval(() => {
            setCooldownMs((ms) => (ms - 1000 <= 0 ? 0 : ms - 1000));
        }, 1000);
        return () => clearInterval(id);
    }, [cooldownMs]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                        Welcome Back to {userProfile.name}'s Wealth Tracker
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Enter your PIN to unlock your dashboard.</p>
                </div>

                {showResetConfirm ? (
                    <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 space-y-4">
                            <div className="flex justify-center">
                                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Forgot Your PIN?</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Since your PIN encrypts your data, <strong>there's no way to recover it</strong>. You must reset the app and start fresh.
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 pt-2">
                                    This will <strong>permanently delete ALL your data</strong> including:
                                </p>
                                <ul className="text-sm text-gray-700 dark:text-gray-300 text-left space-y-1 pl-4">
                                    <li>• All transactions and budgets</li>
                                    <li>• Investment holdings and wishlist</li>
                                    <li>• Goals and debts</li>
                                    <li>• Broker connections</li>
                                    <li>• Your old PIN and profile</li>
                                </ul>
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400 pt-2">
                                    This action cannot be undone!
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetConfirm}
                                disabled={loading}
                                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : 'Yes, Reset Everything'}
                            </button>
                        </div>
                    </div>
                ) : showRecoveryReset ? (
                    <form onSubmit={handleRecoveryReset} className="space-y-6 text-left">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Recovery Key</label>
                            <input
                                type="text"
                                value={recoveryKey}
                                onChange={(e) => setRecoveryKey(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                                placeholder="Enter the recovery key you saved"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New PIN</label>
                                <div className="relative">
                                    <input
                                        type={showNewPin ? 'text' : 'password'}
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value)}
                                        maxLength={8}
                                        className="w-full px-4 pr-12 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                                        placeholder="••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPin((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    >
                                        {showNewPin ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Confirm New PIN</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmNewPin ? 'text' : 'password'}
                                        value={confirmNewPin}
                                        onChange={(e) => setConfirmNewPin(e.target.value)}
                                        maxLength={8}
                                        className="w-full px-4 pr-12 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                                        placeholder="••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmNewPin((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                    >
                                        {showConfirmNewPin ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {recoveryError && <p className="text-red-500 text-sm">{recoveryError}</p>}
                        {cooldownMs > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Please wait {Math.ceil(cooldownMs/1000)}s before trying again.</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowRecoveryReset(false); setRecoveryError(''); }}
                                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || cooldownMs > 0}
                                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : cooldownMs > 0 ? `Wait ${Math.ceil(cooldownMs/1000)}s` : 'Reset PIN'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                type={showPin ? 'text' : 'password'}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength={8}
                                className="w-full px-4 pr-12 py-3 text-center text-2xl tracking-[1em] bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 rounded-lg outline-none transition"
                                placeholder="••••"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                            >
                                {showPin ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300"
                        >
                            {loading ? 'Unlocking...' : 'Unlock'}
                        </button>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowRecoveryReset(true)}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline transition-colors"
                            >
                                Reset PIN with Recovery Key
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(true)}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 underline transition-colors"
                            >
                                Forgot PIN? Reset App (Destructive)
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;