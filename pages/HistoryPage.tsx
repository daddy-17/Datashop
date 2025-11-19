import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { getUserTransactions } from '../services/mockBackend';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { Card } from '../components/Card';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const HistoryPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const data = await getUserTransactions(user.id);
      setTransactions(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const filteredTransactions = transactions.filter(
    t => filterType === 'ALL' || t.type === filterType
  );

  const StatusIcon = ({ status }: { status: TransactionStatus }) => {
    switch (status) {
      case TransactionStatus.SUCCESS:
        return <CheckCircle size={16} className="text-green-500" />;
      case TransactionStatus.FAILED:
        return <XCircle size={16} className="text-red-500" />;
      case TransactionStatus.PENDING:
        return <Clock size={16} className="text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Transaction History</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', TransactionType.PURCHASE, TransactionType.DEPOSIT, TransactionType.REFUND].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize ${
              filterType === type
                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {type === 'ALL' ? 'All Transactions' : type.toLowerCase()}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading history...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-2">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">Status</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">Type</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">Description</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">Reference</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300">Date</th>
                  <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-300 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={tx.status} />
                        <span className={`text-xs font-medium ${
                          tx.status === TransactionStatus.SUCCESS ? 'text-green-700 dark:text-green-400' :
                          tx.status === TransactionStatus.FAILED ? 'text-red-700 dark:text-red-400' :
                          'text-orange-700 dark:text-orange-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                          tx.type === TransactionType.DEPOSIT 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {tx.type === TransactionType.DEPOSIT ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {tx.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-medium dark:text-slate-300 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {tx.reference}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 font-medium text-right ${
                        tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-200'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HistoryPage;