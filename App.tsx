import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Debts from './pages/Debts';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import Reports from './pages/Reports';
import Assistant from './pages/Assistant';
import Settings from './pages/Settings';
import Onboarding from './components/Onboarding';
import Login from './components/Login';
import { useTheme } from './context/ThemeContext';
import Budgeting from './pages/Budgeting';
import PromptHistory from './pages/PromptHistory';

// Import icon components
import { MenuIcon, XIcon } from './components/Icons';

const App: React.FC = () => {
    const { isAuthenticated, isOnboarded, loading, userProfile } = useAppContext();
    const { theme } = useTheme();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [flash, setFlash] = useState<string | null>(null);

    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    // Update document title dynamically
    useEffect(() => {
        const name = userProfile?.name || 'Charan';
        document.title = `${name}'s Wealth Tracker`;
    }, [userProfile?.name]);

    // Show flash banner after certain auth transitions (e.g., PIN recovery)
    useEffect(() => {
        if (!isAuthenticated) return;
        try {
            const msg = localStorage.getItem('zenith-flash');
            if (msg) {
                setFlash(msg);
                localStorage.removeItem('zenith-flash');
                const t = setTimeout(() => setFlash(null), 3000);
                return () => clearTimeout(t);
            }
        } catch {}
    }, [isAuthenticated]);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!isOnboarded) {
        return <Onboarding />;
    }

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <HashRouter>
            <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans`}>
                {flash && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                            {flash}
                        </div>
                    </div>
                )}
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">{userProfile.name}'s Wealth Tracker</h1>
                        <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400">
                            {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </header>
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/budgeting" element={<Budgeting />} />
                            <Route path="/debts" element={<Debts />} />
                            <Route path="/goals" element={<Goals />} />
                            <Route path="/investments" element={<Investments />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/assistant" element={<Assistant />} />
                            <Route path="/prompt-history" element={<PromptHistory />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </HashRouter>
    );
};

export default App;