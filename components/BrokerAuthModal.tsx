import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Broker } from '../types';
import { LightbulbIcon } from './Icons';

interface BrokerAuthModalProps {
    broker: Broker;
    onClose: () => void;
}

const helpContent: Record<Broker['id'], { title: string, steps: string[] }> = {
    upstox: {
        title: "Finding Upstox Credentials",
        steps: [
            "1. Login to the Upstox Developer Console.",
            "2. Create a new app.",
            "3. Find your 'API Key' (Client ID) and 'API Secret' (Client Secret).",
            "4. Make sure the redirect URI is set correctly for your backend.",
        ]
    },
    angelone: {
        title: "Finding AngelOne Credentials",
        steps: [
             "1. Register for a developer account on the AngelOne SmartAPI portal.",
             "2. Create a new app to get your credentials.",
             "3. Find your 'API Key' (Client ID) and 'Secret Key' (Client Secret).",
        ]
    },
    fyers: {
        title: "Finding Fyers Credentials",
        steps: [
             "1. Login to your Fyers account and navigate to the API dashboard.",
             "2. Create a new app.",
             "3. Your 'Client ID' and 'Secret ID' will be generated for you.",
        ]
    }
};

const BrokerAuthModal: React.FC<BrokerAuthModalProps> = ({ broker, onClose }) => {
    const { updateBrokerConnection } = useAppContext();
    const [clientId, setClientId] = useState(broker.clientId);
    const [clientSecret, setClientSecret] = useState(broker.clientSecret);
    const [showHelp, setShowHelp] = useState(false);
    const [error, setError] = useState('');

    const handleConnect = () => {
        if (!clientId || !clientSecret) {
            setError("Please provide both Client ID and Client Secret.");
            return;
        }
        setError('');
        updateBrokerConnection(broker.id, clientId, clientSecret, true);
        onClose();
    };

    const handleDisconnect = () => {
        updateBrokerConnection(broker.id, '', '', false);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-2">Connect to {broker.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Enter your developer credentials to sync data via your backend.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Client ID (API Key)</label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Client Secret (API Secret)</label>
                        <input
                            type="password"
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                            className="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="mt-4">
                    <button onClick={() => setShowHelp(!showHelp)} className="text-sm text-indigo-500 flex items-center gap-1">
                        <LightbulbIcon className="w-4 h-4" />
                        How do I get these?
                    </button>
                    {showHelp && (
                        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs space-y-2">
                             <h4 className="font-bold mb-1">{helpContent[broker.id].title}</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {helpContent[broker.id].steps.map((step, i) => <li key={i}>{step}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-6">
                    {broker.isConnected ? (
                         <button onClick={handleDisconnect} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg">
                            Disconnect
                        </button>
                    ) : (<div />) /* Placeholder to keep layout consistent */}
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg">
                            Cancel
                        </button>
                        <button onClick={handleConnect} className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg">
                            {broker.isConnected ? 'Update' : 'Connect'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrokerAuthModal;