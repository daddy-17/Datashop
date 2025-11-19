import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { Card } from '../components/Card';
import { Wallet, ShoppingBag, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Transaction, TransactionType } from '../types';

const DashboardPage = () => {
  const { user } = useAuth();
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);

  useEffect(() => {
    // Load recent tx for this user from local storage "DB"
    const allTxs = JSON.parse(localStorage.getItem('db_transactions') || '[]');
    const myTxs = allTxs.filter((t: Transaction) => t.userId === user?.id).slice(0, 5);
    setRecentTx(myTxs);
  }, [user?.id]);

  const StatCard = ({ title, value, icon: Icon, color, action }: any) => (
    <Card className="flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {action && <Link to={action.to} className="text-sm text-primary-600 hover:underline font-medium">{action.label}</Link>}
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold dark:text-white mt-1">{value}</h3>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Overview of your account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Wallet Balance" 
          value={`GHS ${user?.walletBalance.toFixed(2)}`} 
          icon={Wallet} 
          color="bg-primary-500"
          action={{ label: 'Deposit', to: '/wallet' }}
        />
        <StatCard 
          title="Total Purchases" 
          value={recentTx.filter(t => t.type === TransactionType.PURCHASE).length} 
          icon={ShoppingBag} 
          color="bg-purple-500"
          action={{ label: 'Buy Data', to: '/buy' }}
        />
        <StatCard 
          title="Pending Actions" 
          value="0" 
          icon={Clock} 
          color="bg-orange-500"
        />
      </div>

      <div>
        <h2 className="text-lg font-bold dark:text-white mb-4">Recent Transactions</h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {recentTx.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">No transactions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">Type</th>
                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">Description</th>
                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">Date</th>
                    <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          tx.type === TransactionType.DEPOSIT 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {tx.type === TransactionType.DEPOSIT ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">{tx.description}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className={`px-6 py-4 font-medium text-right ${
                        tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;