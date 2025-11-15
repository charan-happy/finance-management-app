import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Goal } from '../types';

const GoalModal: React.FC<{ 
    onClose: () => void; 
    onSave: (goal: Omit<Goal, 'id'> | Goal) => void;
    existingGoal: Goal | null;
}> = ({ onClose, onSave, existingGoal }) => {
    const [name, setName] = useState(existingGoal?.name || '');
    const [targetAmount, setTargetAmount] = useState(existingGoal?.targetAmount.toString() || '');
    const [savedAmount, setSavedAmount] = useState(existingGoal?.savedAmount.toString() || '0');
    const [targetDate, setTargetDate] = useState(existingGoal ? new Date(existingGoal.targetDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const goalData = {
            name,
            targetAmount: parseFloat(targetAmount),
            savedAmount: parseFloat(savedAmount),
            targetDate: new Date(targetDate).toISOString(),
        };

        if (existingGoal) {
            onSave({ ...goalData, id: existingGoal.id });
        } else {
            onSave(goalData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{existingGoal ? 'Edit' : 'Add'} Goal</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Goal Name (e.g., New Car)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="number" placeholder="Target Amount (₹)" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <input type="number" placeholder="Amount Already Saved (₹)" value={savedAmount} onChange={e => setSavedAmount(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
                    <div>
                        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Date</label>
                        <input type="date" id="targetDate" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" required />
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
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const Goals: React.FC = () => {
    const { goals, addGoal, updateGoal, deleteGoal } = useAppContext();
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const handleOpenModal = (goal: Goal | null = null) => {
        setEditingGoal(goal);
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setEditingGoal(null);
        setShowModal(false);
    };

    const handleSaveGoal = (goalData: Omit<Goal, 'id'> | Goal) => {
        if ('id' in goalData) {
            updateGoal(goalData);
        } else {
            addGoal(goalData);
        }
        handleCloseModal();
    };

    const handleDeleteGoal = (id: string) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            deleteGoal(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Financial Goals</h1>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                    + Add Goal
                </button>
            </div>

            {showModal && <GoalModal onClose={handleCloseModal} onSave={handleSaveGoal} existingGoal={editingGoal} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => (
                    <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 flex flex-col">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex-grow">{goal.name}</h3>
                             <span className="text-xs font-medium text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-full whitespace-nowrap">
                                Target: {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                <span>Saved: ₹{goal.savedAmount.toLocaleString('en-IN')}</span>
                                <span>Target: ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <ProgressBar value={goal.savedAmount} total={goal.targetAmount} />
                        </div>
                        <div className="flex justify-end items-center pt-2">
                             <button onClick={() => handleOpenModal(goal)} className="text-sm text-gray-500 hover:text-indigo-500 px-2 py-1">Edit</button>
                             <button onClick={() => handleDeleteGoal(goal.id)} className="text-sm text-gray-500 hover:text-red-500 px-2 py-1">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {goals.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400">No goals set yet. Let's create one!</p>
                </div>
            )}
        </div>
    );
};

export default Goals;