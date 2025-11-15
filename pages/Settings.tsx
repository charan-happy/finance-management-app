import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Broker } from '../types';
import { UpstoxIcon, AngelOneIcon, FyersIcon, CheckCircleIcon } from '../components/Icons';
import BrokerAuthModal from '../components/BrokerAuthModal';

const Settings: React.FC = () => {
    const { brokers, geminiApiKey, userProfile, updateData } = useAppContext();
    const [localGeminiKey, setLocalGeminiKey] = useState<string>(geminiApiKey);
    const [age, setAge] = useState<string>(userProfile.age ? userProfile.age.toString() : '');
    const [modalBroker, setModalBroker] = useState<Broker | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [syncMessage, setSyncMessage] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

    const handleSave = () => {
        updateData({ 
            geminiApiKey: localGeminiKey,
            userProfile: { age: age ? parseInt(age, 10) : null }
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