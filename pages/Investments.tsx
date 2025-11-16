import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { InvestmentType, InvestmentWish, InvestmentHolding } from '../types';
import { UpstoxIcon, AngelOneIcon, FyersIcon } from '../components/Icons';
import { createBrokerService } from '../services/brokerService';
import { config } from '../services/config';

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
    const { investmentWishlist, investmentHoldings, addInvestmentWish, addMultipleInvestmentHoldings, brokers, addInvestmentHolding, updateInvestmentHolding, deleteInvestmentHolding } = useAppContext();
    const [showWishlistModal, setShowWishlistModal] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualState, setManualState] = useState<Partial<InvestmentHolding> | null>(null);
    const [showSalaryPlanner, setShowSalaryPlanner] = useState(false);
    
    const handleSyncAllBrokers = async () => {
        const connectedBrokers = brokers.filter(b => b.isConnected);
        
        if (connectedBrokers.length === 0) {
            setSyncMessage('Please connect at least one broker in Settings.');
            setTimeout(() => setSyncMessage(''), 3000);
            return;
        }
        
        setSyncing(true);
        setSyncMessage(`Syncing with ${connectedBrokers.length} broker(s)...`);
        
        try {
            let totalHoldings = 0;
            
            for (const broker of connectedBrokers) {
                try {
                    const accessToken = localStorage.getItem(`${broker.id}-access-token`);
                    if (!accessToken) continue;
                    
                    const brokerService = createBrokerService(broker.id, config.useMockBroker);
                    const holdings = await brokerService.fetchHoldings(accessToken);
                    
                    // Add fetched holdings with broker ID to prevent duplicates
                    addMultipleInvestmentHoldings(holdings, broker.id);
                    
                    totalHoldings += holdings.length;
                } catch (error) {
                    console.error(`Failed to sync ${broker.name}:`, error);
                }
            }
            
            setSyncMessage(`Successfully synced ${totalHoldings} holdings!`);
            setTimeout(() => setSyncMessage(''), 5000);
        } catch (error: any) {
            setSyncMessage('Sync failed. Please try again.');
            setTimeout(() => setSyncMessage(''), 3000);
        } finally {
            setSyncing(false);
        }
    };
    
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
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Portfolio</h1>
                    <div className="flex gap-2 items-center">
                        {syncMessage && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">{syncMessage}</span>
                        )}
                        <button 
                            onClick={handleSyncAllBrokers}
                            disabled={syncing}
                            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {syncing ? 'Syncing...' : '🔄 Sync Brokers'}
                        </button>
                        <button onClick={() => { setManualState(null); setShowManualModal(true); }} className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg">
                            + Add Holding
                        </button>
                        <button onClick={() => setShowSalaryPlanner(true)} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg">
                            Salary Planner
                        </button>
                    </div>
                </div>
                
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
                                            <div className="ml-3 flex gap-2">
                                                <button onClick={() => { setManualState(h); setShowManualModal(true); }} className="text-sm text-indigo-600 underline">Edit</button>
                                                <button onClick={() => { if(confirm('Delete this holding?')) deleteInvestmentHolding(h.id); }} className="text-sm text-red-600 underline">Delete</button>
                                            </div>
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
                {/* Manual Add/Edit Modal */}
                {showManualModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold mb-4">{manualState?.id ? 'Edit Holding' : 'Add Holding'}</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget as HTMLFormElement;
                                const formData = new FormData(form);
                                const name = formData.get('name') as string;
                                const type = formData.get('type') as InvestmentType;
                                const quantity = parseFloat(formData.get('quantity') as string) || 0;
                                const avgPrice = parseFloat(formData.get('avgPrice') as string) || 0;
                                const currentPrice = parseFloat(formData.get('currentPrice') as string) || 0;
                                const brokerId = formData.get('brokerId') as any || 'upstox';

                                if (manualState?.id) {
                                    updateInvestmentHolding({ id: manualState.id, name, type, quantity, avgPrice, currentPrice, brokerId });
                                } else {
                                    addInvestmentHolding({ name, type, quantity, avgPrice, currentPrice, brokerId });
                                }
                                setShowManualModal(false);
                            }} className="space-y-4">
                                <input name="name" defaultValue={manualState?.name || ''} placeholder="Name" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                                <select name="type" defaultValue={manualState?.type || InvestmentType.STOCK} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    {(Object.values(InvestmentType) as InvestmentType[]).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <input name="quantity" type="number" defaultValue={manualState?.quantity ?? 0} placeholder="Quantity" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                                <input name="avgPrice" type="number" defaultValue={manualState?.avgPrice ?? 0} placeholder="Average Price" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                                <input name="currentPrice" type="number" defaultValue={manualState?.currentPrice ?? 0} placeholder="Current Price" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                                <select name="brokerId" defaultValue={manualState?.brokerId || 'upstox'} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    {brokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowManualModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Salary Planner Modal */}
                {showSalaryPlanner && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold mb-4">Salary Planner</h3>
                            <SalaryPlanner onClose={() => setShowSalaryPlanner(false)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SalaryPlanner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addBudget, addTransaction } = useAppContext();
    const [salary, setSalary] = useState('');
    const [allocations, setAllocations] = useState<{ label: string; percent: string }[]>([
        { label: 'Rent', percent: '30' },
        { label: 'Groceries', percent: '15' },
        { label: 'Savings', percent: '20' },
        { label: 'Investments', percent: '20' },
        { label: 'Misc', percent: '15' },
    ]);

    const handleGenerate = () => {
        const s = parseFloat(salary || '0');
        if (!s || s <= 0) return;
        allocations.forEach(a => {
            const percent = parseFloat(a.percent || '0');
            const amount = Math.round((s * percent) / 100);
            addBudget({ category: a.label, amount });
            // also add a recurring transaction template (income->expense)
            addTransaction({ type: 'expense' as any, category: a.label, amount, date: new Date().toISOString(), description: 'Planned from salary', isRecurring: true });
        });
        onClose();
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Monthly Salary (₹)</label>
                <input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="space-y-2">
                {allocations.map((a, i) => (
                    <div key={i} className="flex gap-2">
                        <input className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" value={a.label} onChange={e => setAllocations(allocations.map((x,j)=> j===i ? {...x, label: e.target.value} : x))} />
                        <input className="w-28 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" value={a.percent} onChange={e => setAllocations(allocations.map((x,j)=> j===i ? {...x, percent: e.target.value} : x))} />
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleGenerate} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Generate Budgets</button>
            </div>
        </div>
    );
};

export default Investments;