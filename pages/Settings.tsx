import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Broker } from '../types';
import { UpstoxIcon, AngelOneIcon, FyersIcon, CheckCircleIcon } from '../components/Icons';
import BrokerAuthModal from '../components/BrokerAuthModal';

const Settings: React.FC = () => {
    const { brokers, geminiApiKey, userProfile, updateData, changePin, resetApp } = useAppContext();
    const [localGeminiKey, setLocalGeminiKey] = useState<string>(geminiApiKey);
    const [age, setAge] = useState<string>(userProfile.age ? userProfile.age.toString() : '');
    const [modalBroker, setModalBroker] = useState<Broker | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [syncMessage, setSyncMessage] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showChangePinModal, setShowChangePinModal] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [pinSuccess, setPinSuccess] = useState(false);

    const handleSave = () => {
        updateData({ 
            geminiApiKey: localGeminiKey,
            userProfile: { ...userProfile, age: age ? parseInt(age, 10) : null }
        });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
    };
    
    const handleBrokerSync = () => {
        const connectedBrokers = brokers.filter(b => b.isConnected);
        if (connectedBrokers.length === 0) {
            setSyncStatus('error');
            setSyncMessage("Please connect to at least one broker first.");
            setTimeout(() => setSyncStatus('idle'), 3000);
            return;
        }

        setSyncStatus('syncing');
        setSyncMessage('Sync initiated with backend. Your portfolio will be updated shortly.');
        
        // In a real app, you would trigger a backend API call here.
        // For this version, we'll just show the message and reset after a few seconds.
        setTimeout(() => {
            setSyncStatus('idle');
            setSyncMessage('');
        }, 5000);
    }

    const handleGitHubBackup = () => {
        const data = localStorage.getItem('zenith-finance-data');
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'zenith-finance-backup.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    const handleResetApp = async () => {
        await resetApp();
    };

    const handleChangePin = async () => {
        setPinError('');
        setPinSuccess(false);

        // Validation
        if (!oldPin || !newPin || !confirmNewPin) {
            setPinError('All fields are required');
            return;
        }
        if (newPin.length < 4) {
            setPinError('New PIN must be at least 4 characters');
            return;
        }
        if (newPin !== confirmNewPin) {
            setPinError('New PINs do not match');
            return;
        }
        if (oldPin === newPin) {
            setPinError('New PIN must be different from old PIN');
            return;
        }

        // Attempt to change PIN
        const success = await changePin(oldPin, newPin);
        if (!success) {
            setPinError('Current PIN is incorrect');
            return;
        }

        // Success
        setPinSuccess(true);
        setOldPin('');
        setNewPin('');
        setConfirmNewPin('');
        setTimeout(() => {
            setShowChangePinModal(false);
            setPinSuccess(false);
        }, 2000);
    };

    const isSyncDisabled = syncStatus === 'syncing' || !brokers.some(b => b.isConnected);
    
    const BrokerIcon: React.FC<{ brokerId: Broker['id'], className?: string }> = ({ brokerId, className }) => {
        switch (brokerId) {
            case 'upstox': return <UpstoxIcon className={className} />;
            case 'angelone': return <AngelOneIcon className={className} />;
            case 'fyers': return <FyersIcon className={className} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {modalBroker && <BrokerAuthModal broker={modalBroker} onClose={() => setModalBroker(null)} />}
            
            {/* Change PIN Modal */}
            {showChangePinModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Change PIN</h2>
                            <button 
                                onClick={() => {
                                    setShowChangePinModal(false);
                                    setOldPin('');
                                    setNewPin('');
                                    setConfirmNewPin('');
                                    setPinError('');
                                    setPinSuccess(false);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Current PIN
                                </label>
                                <input
                                    type="password"
                                    value={oldPin}
                                    onChange={(e) => setOldPin(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg outline-none transition-all"
                                    placeholder="Enter current PIN"
                                    maxLength={8}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New PIN (minimum 4 characters)
                                </label>
                                <input
                                    type="password"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg outline-none transition-all"
                                    placeholder="Enter new PIN"
                                    maxLength={8}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm New PIN
                                </label>
                                <input
                                    type="password"
                                    value={confirmNewPin}
                                    onChange={(e) => setConfirmNewPin(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-lg outline-none transition-all"
                                    placeholder="Confirm new PIN"
                                    maxLength={8}
                                />
                            </div>

                            {pinError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <p className="text-sm text-red-600 dark:text-red-400">{pinError}</p>
                                </div>
                            )}

                            {pinSuccess && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">✓ PIN changed successfully!</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowChangePinModal(false);
                                    setOldPin('');
                                    setNewPin('');
                                    setConfirmNewPin('');
                                    setPinError('');
                                    setPinSuccess(false);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePin}
                                disabled={pinSuccess}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                            >
                                Change PIN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>

            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Providing your age helps the AI assistant give more relevant advice.
                </p>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Age</label>
                <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-1 w-full max-w-xs px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 30"
                />
            </div>

            {/* Gemini API Key */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    AI Assistant (Gemini)
                </h2>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
                <input
                    type="password"
                    value={localGeminiKey}
                    onChange={(e) => setLocalGeminiKey(e.target.value)}
                    className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your Google Gemini API Key"
                />
            </div>
            
            {/* Broker Integration */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                 <h2 className="text-xl font-semibold mb-1">Broker Integration</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Connect your broker accounts to sync investments via your backend.
                </p>

                <div className="space-y-4 mb-4">
                    {brokers.map(broker => (
                        <div key={broker.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <BrokerIcon brokerId={broker.id} className="w-8 h-8"/>
                                <span className="font-semibold">{broker.name}</span>
                            </div>
                            {broker.isConnected ? (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <span className="font-semibold">Connected</span>
                                    <button onClick={() => setModalBroker(broker)} className="ml-4 text-sm text-gray-500 hover:text-indigo-500">Edit</button>
                                </div>
                            ) : (
                                <button onClick={() => setModalBroker(broker)} className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg text-sm">
                                    Connect
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleBrokerSync} 
                        disabled={isSyncDisabled}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-opacity"
                    >
                        {syncStatus === 'syncing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100 mr-2"></div>}
                        {syncStatus === 'syncing' ? 'Syncing...' : 'Sync with Brokers'}
                    </button>
                     {(syncStatus === 'syncing' || syncStatus === 'error') && <p className={`text-sm ${syncStatus === 'error' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{syncMessage}</p>}
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Data Management</h2>
                <div className="flex items-center space-x-4">
                     <button onClick={handleGitHubBackup} className="px-4 py-2 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 font-semibold rounded-lg">
                        Backup Data (Download)
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download a backup file to save to a private GitHub repo or your local machine.</p>
                </div>
            </div>

            {/* Security - Change PIN */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-2">Security</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Change your PIN to keep your account secure.
                </p>
                
                <button 
                    onClick={() => setShowChangePinModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Change PIN
                </button>
            </div>

            {/* Danger Zone - Reset App */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-red-200 dark:border-red-900">
                <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">Danger Zone</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Want to start completely fresh? This will wipe everything and return the app to initial setup.
                </p>
                
                {showResetConfirm ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Complete Application Reset</h4>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>This is NOT for recovering a forgotten PIN.</strong> Use this only if you want to start over from scratch. 
                            </p>
                            <div className="bg-white dark:bg-gray-900/50 rounded p-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Everything will be deleted:</p>
                                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                    <li>✗ All transactions, budgets, and financial records</li>
                                    <li>✗ Investment holdings and wishlist</li>
                                    <li>✗ Goals, debts, and chat history</li>
                                    <li>✗ Broker connections and API keys</li>
                                    <li>✗ Your PIN and profile settings</li>
                                </ul>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3">
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    <strong>💡 Tip:</strong> Make sure you've backed up your data first using the "Backup Data" button above!
                                </p>
                            </div>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400 text-center pt-2">
                                ⚠️ This action CANNOT be undone! ⚠️
                            </p>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                                <li>All transactions, budgets, and financial records</li>
                                <li>Investment holdings and wishlist</li>
                                <li>Goals, debts, and chat history</li>
                                <li>Broker connections and API keys</li>
                                <li>Your PIN and profile settings</li>
                            </ul>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400 pt-2">
                                This action CANNOT be undone!
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetApp}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
                            >
                                Yes, Delete Everything
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowResetConfirm(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Reset Application
                    </button>
                )}
            </div>

            <div className="text-right flex justify-end items-center gap-4">
                 {saveStatus === 'success' && <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully!</p>}
                <button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform">
                    Save All Settings
                </button>
            </div>
        </div>
    );
};

export default Settings;