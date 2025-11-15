import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
);
const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const TransactionModal: React.FC<{
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    existingTransaction: Transaction | null;
}> = ({ onClose, onSave, existingTransaction }) => {
    const [type, setType] = useState<TransactionType>(existingTransaction?.type || TransactionType.EXPENSE);
    const [amount, setAmount] = useState(existingTransaction?.amount.toString() || '');
    const [category, setCategory] = useState(existingTransaction?.category || '');
    const [description, setDescription] = useState(existingTransaction?.description || '');
    const [date, setDate] = useState(existingTransaction ? new Date(existingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [isRecurring, setIsRecurring] = useState(existingTransaction?.isRecurring || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category || !description) {
            alert("Please fill all fields.");
            return;
        }
        const transactionData = {
            type,
            amount: parseFloat(amount),
            category,
            description,
            date: new Date(date).toISOString(),
            isRecurring,
        };
        
        if (existingTransaction) {
            onSave({ ...transactionData, id: existingTransaction.id });
        } else {
            onSave(transactionData);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{existingTransaction ? 'Edit' : 'Add'} Transaction</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`px-4 py-2 rounded-l-md w-1/2 ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Expense</button>
                            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`px-4 py-2 rounded-r-md w-1/2 ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Income</button>
                        </div>
                    </div>
                    <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none" required />
                    <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none" required />
                    <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none" required />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none" required />
                    <div className="flex items-center">
                        <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <label htmlFor="recurring" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Recurring Transaction</label>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Transactions: React.FC = () => {
    const { transactions, addTransaction, updateTransaction, deleteTransaction } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [filterYear, setFilterYear] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');

    const availableYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a,b) => b-a);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const yearMatch = filterYear === 'all' || date.getFullYear() === parseInt(filterYear, 10);
            const monthMatch = filterMonth === 'all' || (date.getMonth() + 1).toString() === filterMonth;
            return yearMatch && monthMatch;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterYear, filterMonth]);

    const handleOpenAddModal = () => {
        setEditingTransaction(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setShowModal(true);
    };
    
    const handleDeleteTransaction = (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(id);
        }
    };

    const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'> | Transaction) => {
        if ('id' in transactionData) {
            updateTransaction(transactionData);
        } else {
            addTransaction(transactionData);
        }
        setShowModal(false);
        setEditingTransaction(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Transactions</h1>
                <div className="flex items-center gap-2">
                    <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-white dark:bg-gray-700 rounded-lg px-2 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="all">All Months</option>
                        {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>)}
                    </select>
                    <select
    value={filterYear}
    onChange={e => setFilterYear(e.target.value)} 
    className="bg-white dark:bg-gray-700 rounded-lg px-2 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
    <option value="all">All Years</option>
    {availableYears.length > 0 ? (
        availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
        ))
    ) : (
        <option disabled>No years found</option>
    )}
</select>

                    <button onClick={handleOpenAddModal} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                        + Add
                    </button>
                </div>
            </div>
            
            {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditingTransaction(null); }} onSave={handleSaveTransaction} existingTransaction={editingTransaction} />}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleOpenEditModal(t)} className="p-2 text-gray-400 hover:text-indigo-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                                <DeleteIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {transactions.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400">No transactions yet. Add one to get started!</p>
                </div>
            )}
        </div>
    );
};

export default Transactions;