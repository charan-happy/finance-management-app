import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
        {children}
    </div>
);

const Dashboard: React.FC = () => {
    const { transactions, debts, goals } = useAppContext();

    // Process data for charts
    const monthlySummary = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
            acc[month] = { name: month, income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            acc[month].income += t.amount;
        } else {
            acc[month].expense += t.amount;
        }
        return acc;
    }, {} as { [key: string]: { name: string, income: number, expense: number } });

    const chartData = Object.values(monthlySummary).slice(-6); // Last 6 months

    const expenseCategories = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = 0;
            }
            acc[t.category] += t.amount;
            return acc;
        }, {} as { [key: string]: number });

    const pieData = Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netWorth = totalIncome - totalExpense;

    const totalDebt = debts.reduce((sum, d) => sum + (d.totalAmount - d.amountPaid), 0);
    const totalGoalsSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);

    const netWorthHistory = useMemo(() => {
        if (transactions.length === 0) return [];

        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let currentNetWorth = 0;
        const monthlyNetWorth: { [key: string]: number } = {};

        sortedTransactions.forEach(t => {
            currentNetWorth += t.type === 'income' ? t.amount : -t.amount;
            const monthName = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyNetWorth[monthName] = currentNetWorth;
        });

        // Ensure chronological order of months
        const sortedMonths = Object.keys(monthlyNetWorth).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

        return sortedMonths.map(month => ({
            name: month,
            netWorth: monthlyNetWorth[month]
        }));

    }, [transactions]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Net Worth">
                    <p className="text-3xl font-bold text-green-500">₹{netWorth.toLocaleString('en-IN')}</p>
                </Card>
                <Card title="Total Debt">
                    <p className="text-3xl font-bold text-red-500">₹{totalDebt.toLocaleString('en-IN')}</p>
                </Card>
                <Card title="Goals Progress">
                    <p className="text-3xl font-bold text-indigo-500">₹{totalGoalsSaved.toLocaleString('en-IN')}</p>
                </Card>
                 <Card title="Quick Add">
                    <div className="flex flex-col space-y-2">
                        <Link to="/transactions?action=add" className="text-center py-2 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                           + Add Transaction
                        </Link>
                         <Link to="/goals?action=add" className="text-center py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                           + Add Goal
                        </Link>
                    </div>
                </Card>
            </div>

            <Card title="Financial Journey (Net Worth)">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart 
                        data={netWorthHistory}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                        <XAxis dataKey="name" stroke="rgb(156 163 175)" />
                        <YAxis stroke="rgb(156 163 175)" tickFormatter={(value) => `₹${Number.isFinite(value) ? (value / 1000).toFixed(0) : 0}k`}/>
                        <Tooltip 
                            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Net Worth']} 
                            contentStyle={{ 
                                backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                                border: 'none', 
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            labelStyle={{ color: '#a5b4fc' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Area 
                            type="monotone" 
                            dataKey="netWorth" 
                            stroke="#8884d8" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorNetWorth)" 
                            name="Net Worth" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Income vs Expense (Last 6 Months)" className="lg:col-span-2">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="rgb(156 163 175)" />
                            <YAxis stroke="rgb(156 163 175)" tickFormatter={(value) => `₹${value / 1000}k`}/>
                            <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', color: '#fff' }}/>
                            <Legend />
                            <Bar dataKey="income" fill="#82ca9d" name="Income" />
                            <Bar dataKey="expense" fill="#f472b6" name="Expense" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Expense Categories">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                             <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', color: '#fff' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
        </div>
    );
};

export default Dashboard;