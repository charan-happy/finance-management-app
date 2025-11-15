import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { 
    DashboardIcon, TransactionsIcon, DebtsIcon, GoalsIcon, 
    InvestmentsIcon, ReportsIcon, AssistantIcon, SettingsIcon,
    SunIcon, MoonIcon, LogoutIcon, BudgetIcon, PromptHistoryIcon
} from '../Icons';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const navItems = [
    { to: "/dashboard", icon: DashboardIcon, label: "Dashboard" },
    { to: "/transactions", icon: TransactionsIcon, label: "Transactions" },
    { to: "/budgeting", icon: BudgetIcon, label: "Budgeting" },
    { to: "/debts", icon: DebtsIcon, label: "Debts" },
    { to: "/goals", icon: GoalsIcon, label: "Goals" },
    { to: "/investments", icon: InvestmentsIcon, label: "Investments" },
    { to: "/reports", icon: ReportsIcon, label: "Reports" },
    { to: "/assistant", icon: AssistantIcon, label: "AI Assistant" },
    { to: "/prompt-history", icon: PromptHistoryIcon, label: "Prompt History" },
    { to: "/settings", icon: SettingsIcon, label: "Settings" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout, userProfile } = useAppContext();

    const linkClass = "flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 rounded-lg transition-all duration-200 ease-in-out";
    const activeLinkClass = "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg";

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={toggleSidebar}></div>
            <aside className={`absolute md:relative z-40 flex flex-col w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700 px-4">
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 text-center">
                        {userProfile.name}'s Wealth Tracker
                    </h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={window.innerWidth < 768 ? toggleSidebar : undefined}
                            className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <item.icon className="w-6 h-6 mr-3" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                     <button
                        onClick={toggleTheme}
                        className="w-full flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {theme === 'light' ? <MoonIcon className="w-6 h-6 mr-3" /> : <SunIcon className="w-6 h-6 mr-3" />}
                        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                    <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-3 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogoutIcon className="w-6 h-6 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;