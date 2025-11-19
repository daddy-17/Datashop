import React, { useState } from 'react';
import { useAuth } from '../App';
import { initiatePaystackDeposit, verifyPaystackTransaction } from '../services/mockBackend';
import { Card } from '../components/Card';
import { toast } from 'react-hot-toast';
import { CreditCard, ShieldCheck, Check, Loader2 } from 'lucide-react';

const WalletPage = () => {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payState, setPayState] = useState<'INIT' | 'PROCESSING' | 'SUCCESS'>('INIT');
  const [txRef, setTxRef] = useState('');

  const handleDepositClick = async () => {
    const val = parseFloat(amount);
    if (!val || val < 1) {
      toast.error('Minimum deposit is GHS 1.00');
      return;
    }

    try {
      // 1. Get Mock Paystack Url
      const { reference } = await initiatePaystackDeposit(user!.id, val);
      setTxRef(reference);
      // 2. Open "Paystack" Modal
      setIsModalOpen(true);
      setPayState('INIT');
    } catch (e: any) {
      toast.error('Failed to initialize payment');
    }
  };

  const handleSimulatePayment = async () => {
    setPayState('PROCESSING');
    try {
      // Simulate user completing payment on Paystack and webhook firing
      const updatedUser = await verifyPaystackTransaction(user!.id, txRef, parseFloat(amount));
      setPayState('SUCCESS');
      refreshUser(updatedUser);
      toast.success('Wallet credited successfully!');
      
      setTimeout(() => {
        setIsModalOpen(false);
        setAmount('');
      }, 2000);
    } catch (e) {
      toast.error('Payment verification failed');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">My Wallet</h1>
      
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
        <div className="p-4">
          <p className="text-slate-400 mb-1 text-sm uppercase tracking-wider">Available Balance</p>
          <h2 className="text-4xl font-bold">GHS {user?.walletBalance.toFixed(2)}</h2>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold dark:text-white mb-4">Top Up Wallet</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full">
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Amount (GHS)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₵</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
                min="1"
              />
            </div>
          </div>
          <button 
            onClick={handleDepositClick}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            Deposit
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck size={14} className="text-green-500" />
          Secured by Paystack
        </div>
      </Card>

      {/* MOCK PAYSTACK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-slate-100 p-4 border-b flex justify-between items-center">
              <h4 className="font-bold text-slate-700">Paystack Checkout (Simulation)</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><div className="w-6 h-6 flex items-center justify-center">x</div></button>
            </div>
            
            <div className="p-8 text-center">
              {payState === 'INIT' && (
                <>
                  <p className="text-slate-600 mb-6">You are about to pay <span className="font-bold text-slate-900">GHS {parseFloat(amount).toFixed(2)}</span> to DataMart Premium.</p>
                  <div className="space-y-3">
                    <button onClick={handleSimulatePayment} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-md transition-transform transform active:scale-95">
                      Pay Successfully
                    </button>
                    <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 py-2 text-sm hover:underline">
                      Cancel Payment
                    </button>
                  </div>
                </>
              )}

              {payState === 'PROCESSING' && (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
                  <p className="text-slate-600">Verifying transaction...</p>
                </div>
              )}

              {payState === 'SUCCESS' && (
                <div className="flex flex-col items-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-green-600">Payment Successful</h3>
                  <p className="text-slate-500 mt-2">Redirecting...</p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-3 text-center text-xs text-slate-400 border-t">
              Test Mode: No real money is charged.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;