import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Budget } from '../types';

const BudgetModal: React.FC<{
    onClose: () => void;
    onSave: (budget: Omit<Budget, 'id'> | Budget) => void;
    existingBudget: Budget | null;
}> = ({ onClose, onSave, existingBudget }) => {
    const [category, setCategory] = useState(existingBudget?.category || '');
    const [amount, setAmount] = useState(existingBudget?.amount.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount) {
            alert('Please fill all fields.');
            return;
        }
        const budgetData = {
            category,
            amount: parseFloat(amount),
        };

        if (existingBudget) {
            onSave({ ...budgetData, id: existingBudget.id });
        } else {
            onSave(budgetData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{existingBudget ? 'Edit' : 'Add'} Budget</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Category (e.g., Groceries)" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="number" placeholder="Budget Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProgressBar: React.FC<{ value: number; total: number }> = ({ value, total }) => {
    const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;
    const isOverBudget = value > total;
    const colorClass = isOverBudget ? 'from-red-500 to-orange-500' : 'from-green-400 to-blue-500';

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
            <div className={`bg-gradient-to-r ${colorClass} h-4 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const Budgeting: React.FC = () => {
    const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const handleSave = (budgetData: Omit<Budget, 'id'> | Budget) => {
        if ('id' in budgetData) {
            updateBudget(budgetData);
        } else {
            addBudget(budgetData);
        }
        setShowModal(false);
        setEditingBudget(null);
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure you want to delete this budget?")) {
            deleteBudget(id);
        }
    }

    const openModal = (budget: Budget | null = null) => {
        setEditingBudget(budget);
        setShowModal(true);
    };

    const spending = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
    }, [transactions]);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Monthly Budgeting</h1>
                <button onClick={() => openModal()} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                    + Add Budget
                </button>
            </div>

            {showModal && <BudgetModal onClose={() => { setShowModal(false); setEditingBudget(null); }} onSave={handleSave} existingBudget={editingBudget} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map(budget => {
                    const spent = spending[budget.category] || 0;
                    const remaining = budget.amount - spent;
                    const isOver = remaining < 0;
                    return (
                        <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{budget.category}</h3>
                                <div className="flex -mr-2">
                                    <button onClick={() => openModal(budget)} className="text-gray-400 hover:text-indigo-500 p-2 text-sm">Edit</button>
                                    <button onClick={() => handleDelete(budget.id)} className="text-gray-400 hover:text-red-500 p-2 text-sm">Delete</button>
                                </div>
                            </div>
                            <ProgressBar value={spent} total={budget.amount} />
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Spent: ₹{spent.toLocaleString('en-IN')}</span>
                                <span className={isOver ? 'text-red-500 font-semibold' : ''}>
                                    {isOver ? `Over by ₹${Math.abs(remaining).toLocaleString('en-IN')}` : `Remaining: ₹${remaining.toLocaleString('en-IN')}`}
                                </span>
                            </div>
                            <p className="text-sm text-right text-gray-500">Total Budget: ₹{budget.amount.toLocaleString('en-IN')}</p>
                        </div>
                    );
                })}
            </div>

             {budgets.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400">No budgets set for this month. Create one to start tracking!</p>
                </div>
            )}
        </div>
    );
};

export default Budgeting;