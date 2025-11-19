import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { getPackages, purchaseDataBundle } from '../services/mockBackend';
import { DataPackage, Network } from '../types';
import { NETWORK_COLORS } from '../constants';
import { Card } from '../components/Card';
import { toast } from 'react-hot-toast';
import { Search, Smartphone, CheckCircle } from 'lucide-react';

const BuyDataPage = () => {
  const { user, refreshUser } = useAuth();
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | 'ALL'>('ALL');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getPackages();
      setPackages(data.filter(p => p.isActive));
      setLoading(false);
    };
    load();
  }, []);

  const filteredPackages = packages.filter(p => selectedNetwork === 'ALL' || p.network === selectedNetwork);

  const handlePurchase = async (pkg: DataPackage) => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    const price = pkg.adminPrice ?? pkg.datamartPrice;
    if (!user || user.walletBalance < price) {
      toast.error('Insufficient wallet balance');
      return;
    }

    if (!confirm(`Confirm purchase of ${pkg.name} for ${phone} at GHS ${price.toFixed(2)}?`)) return;

    setProcessingId(pkg.id);
    try {
      await purchaseDataBundle(user.id, pkg.id, phone);
      toast.success('Transaction successful!');
      // Refresh wallet locally
      refreshUser({ ...user, walletBalance: user.walletBalance - price });
      setPhone('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Data Store</h1>

      {/* Network Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button 
          onClick={() => setSelectedNetwork('ALL')}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selectedNetwork === 'ALL' 
              ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
              : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          All Networks
        </button>
        {Object.values(Network).map(net => (
          <button
            key={net}
            onClick={() => setSelectedNetwork(net)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedNetwork === net
                ? 'ring-2 ring-offset-2 ring-primary-500 bg-white dark:bg-slate-700 dark:text-white'
                : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {net}
          </button>
        ))}
      </div>

      {/* Phone Input Sticky */}
      <Card className="sticky top-20 z-20 border-primary-200 dark:border-primary-900 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full">
            <Smartphone className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter Recipient Phone Number"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
             Balance: <span className="font-bold text-slate-900 dark:text-white">GHS {user?.walletBalance.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Packages Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading packages...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPackages.map(pkg => {
            const price = pkg.adminPrice ?? pkg.datamartPrice;
            const isProcessing = processingId === pkg.id;
            return (
              <Card key={pkg.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-bold ${NETWORK_COLORS[pkg.network]}`}>
                  {pkg.network}
                </div>
                
                <div className="pt-4">
                  <h3 className="font-bold text-lg dark:text-white mb-1">{pkg.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{pkg.capacity} Data Bundle</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      GHS {price.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={isProcessing}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                        isProcessing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-500'
                      }`}
                    >
                      {isProcessing ? 'Sending...' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuyDataPage;