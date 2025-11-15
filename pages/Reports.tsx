import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Reports: React.FC = () => {
    const { transactions } = useAppContext();
    const [filterYear, setFilterYear] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all'); // 'all' or 1-12

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const yearMatch = filterYear === 'all' || date.getFullYear().toString() === filterYear;
            const monthMatch = filterMonth === 'all' || (date.getMonth() + 1).toString() === filterMonth;
            return yearMatch && monthMatch;
        });
    }, [transactions, filterYear, filterMonth]);

    const expenseCategories = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const pieData = Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

    const monthlySummary = filteredTransactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' });
        acc[month] = acc[month] || { name: month, income: 0, expense: 0 };
        if (t.type === 'income') acc[month].income += t.amount;
        else acc[month].expense += t.amount;
        return acc;
    }, {} as Record<string, {name: string, income: number, expense: number}>);
    
    const barData = Object.values(monthlySummary);

    const availableYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a,b) => b-a);

     const netWorthHistory = useMemo(() => {
        if (transactions.length === 0) return [];

        const sortedFilteredTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sortedFilteredTransactions.length === 0) return [];

        const firstDateInFilter = new Date(sortedFilteredTransactions[0].date);

        const startingNetWorth = transactions
            .filter(t => new Date(t.date) < firstDateInFilter)
            .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        
        let currentNetWorth = startingNetWorth;
        const monthlyNetWorth: { [key: string]: number } = {};

        sortedFilteredTransactions.forEach(t => {
            currentNetWorth += t.type === 'income' ? t.amount : -t.amount;
            const monthYear = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
            monthlyNetWorth[monthYear] = currentNetWorth;
        });

        const history = Object.entries(monthlyNetWorth).map(([date, value]) => ({
            name: new Date(date + '-02').toLocaleString('default', { month: 'short', year: 'numeric' }),
            netWorth: value,
            date: date,
        }));
        
        history.sort((a,b) => a.date.localeCompare(b.date));

        return history;
    }, [filteredTransactions, transactions]);

    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Type,Category,Description,Amount\r\n";
        
        filteredTransactions.forEach(t => {
            const row = [
                new Date(t.date).toISOString().split('T')[0],
                t.type,
                t.category,
                `"${t.description.replace(/"/g, '""')}"`,
                t.amount
            ].join(",");
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `charans_wealth_tracker_transactions_${filterYear}_${filterMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h1>
                <div className="flex items-center gap-2">
                    <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-white dark:bg-gray-700 rounded-lg px-2 py-1 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="all">All Months</option>
                        {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>)}
                    </select>
                    <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="bg-white dark:bg-gray-700 rounded-lg px-2 py-1 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                         <option value="all">All Years</option>
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <button 
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Export
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Net Worth Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={netWorthHistory}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value / 1000}k`}/>
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}/>
                        <Legend />
                        <Line type="monotone" dataKey="netWorth" stroke="#8884d8" strokeWidth={2} name="Net Worth" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value / 1000}k`}/>
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                        <Legend />
                        <Bar dataKey="income" fill="#82ca9d" name="Income" />
                        <Bar dataKey="expense" fill="#f472b6" name="Expense" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Reports;