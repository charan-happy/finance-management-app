import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { InvestmentType, InvestmentWish, InvestmentHolding } from '../types';
import { UpstoxIcon, AngelOneIcon, FyersIcon } from '../components/Icons';

const WishlistModal: React.FC<{ onClose: () => void; onSave: (wish: Omit<InvestmentWish, 'id'>) => void }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<InvestmentType>(InvestmentType.STOCK);
    const [targetQuantity, setTargetQuantity] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [broker, setBroker] = useState('Upstox');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, type, targetQuantity: parseFloat(targetQuantity), targetPrice: parseFloat(targetPrice), broker });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Add to Wishlist</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Stock/ETF/MF Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <select value={type} onChange={e => setType(e.target.value as InvestmentType)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {Object.values(InvestmentType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="number" placeholder="Target Quantity" value={targetQuantity} onChange={e => setTargetQuantity(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="number" placeholder="Target Price (₹)" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="text" placeholder="Broker" value={broker} onChange={e => setBroker(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Investments: React.FC = () => {
    const { investmentWishlist, investmentHoldings, addInvestmentWish } = useAppContext();
    const [showWishlistModal, setShowWishlistModal] = useState(false);
    
    const typeColor = (type: InvestmentType) => {
        switch(type) {
            case InvestmentType.STOCK: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case InvestmentType.ETF: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case InvestmentType.MUTUAL_FUND: return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        }
    }

    const BrokerIcon: React.FC<{ brokerId: InvestmentHolding['brokerId'] }> = ({ brokerId }) => {
        switch (brokerId) {
            case 'upstox': return <UpstoxIcon className="w-5 h-5" />;
            case 'angelone': return <AngelOneIcon className="w-5 h-5" />;
            case 'fyers': return <FyersIcon className="w-5 h-5" />;
            default: return null;
        }
    };

    const handleSaveWish = (wish: Omit<InvestmentWish, 'id'>) => {
        addInvestmentWish(wish);
        setShowWishlistModal(false);
    };

    return (
        <div className="space-y-8">
            {showWishlistModal && <WishlistModal onClose={() => setShowWishlistModal(false)} onSave={handleSaveWish} />}
            
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Investment Wishlist</h1>
                    <button onClick={() => setShowWishlistModal(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                        + Add to Wishlist
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {investmentWishlist.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold">{item.name}</h3>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColor(item.type)}`}>{item.type}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Broker: {item.broker}</p>
                            <div className="mt-4 space-y-1">
                                <p className="text-sm">Target Quantity: <span className="font-semibold">{item.targetQuantity}</span></p>
                                <p className="text-sm">Target Price: <span className="font-semibold">₹{item.targetPrice.toLocaleString('en-IN')}</span></p>
                            </div>
                        </div>
                    ))}
                    {investmentWishlist.length === 0 && <p className="text-gray-500 dark:text-gray-400 md:col-span-2 lg:col-span-3">Your investment wishlist is empty.</p>}
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">My Portfolio</h1>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">Quantity</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {investmentHoldings.map(h => (
                                    <tr key={h.id}>
                                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                                            <BrokerIcon brokerId={h.brokerId} />
                                            {h.name}
                                        </td>
                                        <td className="px-6 py-4"> <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColor(h.type)}`}>{h.type}</span></td>
                                        <td className="px-6 py-4 text-right">{h.quantity}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-green-500">₹{(h.quantity * h.currentPrice).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {investmentHoldings.length === 0 && <p className="p-6 text-center text-gray-500 dark:text-gray-400">Your portfolio is empty. Sync with your broker to see sample data.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Investments;