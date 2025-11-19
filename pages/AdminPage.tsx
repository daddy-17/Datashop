import React, { useState, useEffect } from 'react';
import { getPackages, updatePackagePrice, getAllUsers } from '../services/mockBackend';
import { DataPackage, User } from '../types';
import { Card } from '../components/Card';
import { toast } from 'react-hot-toast';
import { DollarSign, Users, Save } from 'lucide-react';

const AdminPage = () => {
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'PRICING' | 'USERS'>('PRICING');
  
  // For editing logic
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pkgData, userData] = await Promise.all([getPackages(), getAllUsers()]);
    setPackages(pkgData);
    setUsers(userData);
  };

  const handlePriceChange = (id: string, val: string) => {
    setEditingPrice(prev => ({ ...prev, [id]: val }));
  };

  const savePrice = async (pkg: DataPackage) => {
    const inputVal = editingPrice[pkg.id];
    if (inputVal === undefined) return; // No change

    const newPrice = inputVal === '' ? undefined : parseFloat(inputVal);
    
    try {
      await updatePackagePrice(pkg.id, newPrice);
      toast.success(`Updated price for ${pkg.name}`);
      loadData(); // Reload
      setEditingPrice(prev => {
          const newState = {...prev};
          delete newState[pkg.id];
          return newState;
      });
    } catch (e) {
      toast.error('Failed to update price');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            <button 
                onClick={() => setActiveTab('PRICING')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'PRICING' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-slate-500'}`}
            >
                Pricing Rules
            </button>
            <button 
                 onClick={() => setActiveTab('USERS')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'USERS' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'text-slate-500'}`}
            >
                Users
            </button>
        </div>
      </div>

      {activeTab === 'PRICING' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-sm">
            <strong>Pricing Logic:</strong> If you set a "Custom Price", users will pay that amount. If left empty, the system defaults to the "Datamart Cost".
          </div>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Network</th>
                    <th className="px-6 py-4">Package Name</th>
                    <th className="px-6 py-4">Datamart Cost</th>
                    <th className="px-6 py-4">Custom User Price</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {packages.map(pkg => (
                    <tr key={pkg.id} className="dark:text-slate-300">
                      <td className="px-6 py-4 font-medium">{pkg.network}</td>
                      <td className="px-6 py-4">{pkg.name}</td>
                      <td className="px-6 py-4 text-slate-500">GHS {pkg.datamartPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="relative max-w-[120px]">
                          <span className="absolute left-3 top-2 text-slate-400">GHS</span>
                          <input 
                            type="number" 
                            className="w-full pl-10 pr-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder={pkg.datamartPrice.toFixed(2)}
                            value={editingPrice[pkg.id] !== undefined ? editingPrice[pkg.id] : (pkg.adminPrice || '')}
                            onChange={(e) => handlePriceChange(pkg.id, e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingPrice[pkg.id] !== undefined && (
                          <button 
                            onClick={() => savePrice(pkg)}
                            className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors"
                            title="Save Price"
                          >
                            <Save size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'USERS' && (
        <Card className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map(u => (
                        <tr key={u.id} className="dark:text-slate-300">
                            <td className="px-6 py-4 font-medium">{u.name}</td>
                            <td className="px-6 py-4 text-slate-500">{u.email}</td>
                            <td className="px-6 py-4 text-right font-mono">GHS {u.walletBalance.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
      )}
    </div>
  );
};

export default AdminPage;