import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Debt } from '../types';

const DebtModal: React.FC<{ 
    onClose: () => void; 
    onSave: (debt: Omit<Debt, 'id'> | Debt) => void;
    existingDebt: Debt | null;
}> = ({ onClose, onSave, existingDebt }) => {
    const [name, setName] = useState(existingDebt?.name || '');
    const [totalAmount, setTotalAmount] = useState(existingDebt?.totalAmount.toString() || '');
    const [amountPaid, setAmountPaid] = useState(existingDebt?.amountPaid.toString() || '0');
    const [monthlyPayment, setMonthlyPayment] = useState(existingDebt?.monthlyPayment.toString() || '');
    const [dueDate, setDueDate] = useState(existingDebt?.dueDate.toString() || '1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const debtData = {
            name,
            totalAmount: parseFloat(totalAmount),
            amountPaid: parseFloat(amountPaid),
            monthlyPayment: parseFloat(monthlyPayment),
            dueDate: parseInt(dueDate),
        };

        if (existingDebt) {
            onSave({ ...debtData, id: existingDebt.id });
        } else {
            onSave(debtData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{existingDebt ? 'Edit' : 'Add'} Debt</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Debt Name (e.g., Car Loan)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="number" placeholder="Total Amount (₹)" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="number" placeholder="Amount Already Paid (₹)" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="number" placeholder="Monthly Payment (₹)" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Due Date (Day)</label>
                        <input type="number" id="dueDate" min="1" max="31" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
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

const ProgressBar: React.FC<{ value: number; total: number }> = ({ value, total }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const Debts: React.FC = () => {
    const { debts, addDebt, updateDebt, deleteDebt } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

    const handleOpenModal = (debt: Debt | null = null) => {
        setEditingDebt(debt);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setEditingDebt(null);
        setShowModal(false);
    };

    const handleSaveDebt = (debtData: Omit<Debt, 'id'> | Debt) => {
        if ('id' in debtData) {
            updateDebt(debtData);
        } else {
            addDebt(debtData);
        }
        handleCloseModal();
    };

    const handleDeleteDebt = (id: string) => {
        if (window.confirm('Are you sure you want to delete this debt?')) {
            deleteDebt(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Debts</h1>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                    + Add Debt
                </button>
            </div>
            
            {showModal && <DebtModal onClose={handleCloseModal} onSave={handleSaveDebt} existingDebt={editingDebt}/>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {debts.map(debt => (
                    <div key={debt.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 flex flex-col">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex-grow">{debt.name}</h3>
                            <span className="text-xs font-medium text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full flex-shrink-0">
                                Due on {debt.dueDate}th
                            </span>
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                <span>Paid: ₹{debt.amountPaid.toLocaleString('en-IN')}</span>
                                <span>Total: ₹{debt.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <ProgressBar value={debt.amountPaid} total={debt.totalAmount} />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                             <p className="text-sm text-gray-600 dark:text-gray-300">Monthly: <span className="font-semibold">₹{debt.monthlyPayment.toLocaleString('en-IN')}</span></p>
                            <div className="flex items-center">
                                <button onClick={() => handleOpenModal(debt)} className="text-sm text-gray-500 hover:text-indigo-500 px-2 py-1">Edit</button>
                                <button onClick={() => handleDeleteDebt(debt.id)} className="text-sm text-gray-500 hover:text-red-500 px-2 py-1">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {debts.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400">You have no debts. That's great news!</p>
                </div>
            )}
        </div>
    );
};

export default Debts;