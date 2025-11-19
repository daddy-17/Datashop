import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { generateApiKey, getApiKeys } from '../services/mockBackend';
import { ApiKey } from '../types';
import { Card } from '../components/Card';
import { toast } from 'react-hot-toast';
import { Key, Plus, Copy, Trash2 } from 'lucide-react';

const DeveloperPage = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKeys();
  }, [user]);

  const loadKeys = async () => {
    if (user) {
      const k = await getApiKeys(user.id);
      setKeys(k);
    }
  };

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await generateApiKey(user.id);
      await loadKeys();
      toast.success('New API Key generated');
    } catch (e) {
      toast.error('Failed to generate key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Developer API</h1>
          <p className="text-slate-500 text-sm">Manage your API keys for external integration</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Generate New Key
        </button>
      </div>

      {keys.length === 0 ? (
        <Card className="text-center py-12">
          <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
            <Key size={32} />
          </div>
          <h3 className="text-lg font-medium dark:text-white">No API Keys Found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">
            Generate a key to start integrating our data services into your own applications.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {keys.map((key) => (
            <Card key={key.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded text-primary-600">
                  <Key size={20} />
                </div>
                <div>
                  <p className="font-mono font-medium text-slate-700 dark:text-slate-200">{key.keyMasked}</p>
                  <p className="text-xs text-slate-400">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors" title="Copy Key">
                    <Copy size={18} />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Revoke Key">
                    <Trash2 size={18} />
                 </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl mt-8">
        <h3 className="font-bold dark:text-white mb-2">Integration Docs</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Use these endpoints to automate your data purchases. All requests require the <code className="bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded text-xs">Authorization: Bearer sk_live_...</code> header.
        </p>
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-green-600 font-bold">GET</span>
                <span className="text-slate-600 dark:text-slate-400">/api/v1/packages</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-blue-600 font-bold">POST</span>
                <span className="text-slate-600 dark:text-slate-400">/api/v1/purchase</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;