import { User, UserRole, DataPackage, Transaction, TransactionType, TransactionStatus, ApiKey, Network } from "../types";
import { INITIAL_PACKAGES } from "../constants";

// Simulating a database in LocalStorage
const DELAY = 600; // Simulate network latency

const getStorage = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return initial;
  return JSON.parse(stored);
};

const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// DB Tables
const DB = {
  users: () => getStorage<User[]>('db_users', []),
  packages: () => getStorage<DataPackage[]>('db_packages', INITIAL_PACKAGES),
  transactions: () => getStorage<Transaction[]>('db_transactions', []),
  apiKeys: () => getStorage<ApiKey[]>('db_apikeys', []),
};

// Helper to save
const saveUsers = (users: User[]) => setStorage('db_users', users);
const savePackages = (pkgs: DataPackage[]) => setStorage('db_packages', pkgs);
const saveTx = (txs: Transaction[]) => setStorage('db_transactions', txs);
const saveKeys = (keys: ApiKey[]) => setStorage('db_apikeys', keys);

// --- AUTH SERVICES ---

export const loginService = async (email: string, password: string): Promise<User> => {
  await new Promise(r => setTimeout(r, DELAY));
  const users = DB.users();
  
  // Admin backdoor for demo
  if (email === 'admin@datamart.com' && password === 'admin') {
    const admin = users.find(u => u.email === email);
    if (admin) return admin;
    
    const newAdmin: User = {
      id: 'admin_1',
      email,
      name: 'Super Admin',
      role: UserRole.ADMIN,
      walletBalance: 10000,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    saveUsers([...users, newAdmin]);
    return newAdmin;
  }

  const user = users.find(u => u.email === email);
  if (!user) throw new Error("Invalid credentials");
  // In real app: bcrypt.compare(password, user.passwordHash)
  if (!user.isActive) throw new Error("Account deactivated");
  
  return user;
};

export const registerService = async (name: string, email: string, password: string): Promise<User> => {
  await new Promise(r => setTimeout(r, DELAY));
  const users = DB.users();
  if (users.find(u => u.email === email)) throw new Error("Email already exists");

  const newUser: User = {
    id: `user_${Date.now()}`,
    name,
    email,
    role: UserRole.USER,
    walletBalance: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  saveUsers([...users, newUser]);
  return newUser;
};

// --- WALLET & PAYSTACK MOCK ---

export const initiatePaystackDeposit = async (userId: string, amount: number): Promise<{ url: string, reference: string }> => {
  // Simulating Backend: POST /api/payment/initialize
  await new Promise(r => setTimeout(r, DELAY));
  const reference = `pay_${Math.random().toString(36).substring(7)}`;
  return {
    url: '#paystack-checkout-sim', // In real app: https://checkout.paystack.com/...
    reference
  };
};

export const verifyPaystackTransaction = async (userId: string, reference: string, amount: number): Promise<User> => {
  // Simulating Backend Webhook Handler
  await new Promise(r => setTimeout(r, DELAY));
  
  const users = DB.users();
  const userIdx = users.findIndex(u => u.id === userId);
  if (userIdx === -1) throw new Error("User not found");

  // Update Balance
  users[userIdx].walletBalance += amount;
  saveUsers(users);

  // Log Transaction
  const newTx: Transaction = {
    id: `tx_${Date.now()}`,
    userId,
    type: TransactionType.DEPOSIT,
    amount,
    reference,
    status: TransactionStatus.SUCCESS,
    description: 'Wallet Deposit via Paystack',
    date: new Date().toISOString()
  };
  saveTx([newTx, ...DB.transactions()]);

  return users[userIdx];
};

// --- DATAMART STORE LOGIC ---

export const getPackages = async (): Promise<DataPackage[]> => {
  await new Promise(r => setTimeout(r, DELAY / 2));
  return DB.packages();
};

export const updatePackagePrice = async (pkgId: string, adminPrice: number | undefined): Promise<void> => {
  await new Promise(r => setTimeout(r, DELAY));
  const pkgs = DB.packages();
  const idx = pkgs.findIndex(p => p.id === pkgId);
  if (idx !== -1) {
    pkgs[idx].adminPrice = adminPrice;
    savePackages(pkgs);
  }
};

export const purchaseDataBundle = async (userId: string, packageId: string, recipientPhone: string): Promise<Transaction> => {
  await new Promise(r => setTimeout(r, DELAY));
  
  const users = DB.users();
  const userIdx = users.findIndex(u => u.id === userId);
  if (userIdx === -1) throw new Error("User not found");
  
  const pkg = DB.packages().find(p => p.id === packageId);
  if (!pkg) throw new Error("Package unavailable");

  // Calculate Cost: If admin price exists, use it. Else use datamart price.
  const cost = pkg.adminPrice ?? pkg.datamartPrice;

  if (users[userIdx].walletBalance < cost) {
    throw new Error("Insufficient wallet balance");
  }

  // Deduct
  users[userIdx].walletBalance -= cost;
  saveUsers(users);

  // Record Transaction
  const tx: Transaction = {
    id: `tx_${Date.now()}`,
    userId,
    type: TransactionType.PURCHASE,
    amount: -cost,
    reference: `dm_${Math.random().toString(36).substring(7)}`,
    status: TransactionStatus.SUCCESS,
    description: `Purchased ${pkg.name} for ${recipientPhone}`,
    date: new Date().toISOString(),
    metadata: { packageId, network: pkg.network }
  };
  
  saveTx([tx, ...DB.transactions()]);
  return tx;
};

// --- ADMIN ---
export const getAllUsers = async (): Promise<User[]> => {
    return DB.users();
}

export const getSystemStats = async () => {
    const txs = DB.transactions();
    const users = DB.users();
    const totalVolume = txs.filter(t => t.type === TransactionType.PURCHASE).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return {
        totalUsers: users.length,
        totalVolume,
        recentTransactions: txs.slice(0, 5)
    }
}

// --- DEV API KEYS ---

export const generateApiKey = async (userId: string) => {
    await new Promise(r => setTimeout(r, DELAY));
    const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        userId,
        keyMasked: `sk_live_****${Math.random().toString(36).substring(3,7)}`,
        createdAt: new Date().toISOString()
    };
    saveKeys([newKey, ...DB.apiKeys()]);
    return newKey;
}

export const getApiKeys = async (userId: string) => {
    return DB.apiKeys().filter(k => k.userId === userId);
}

// --- HISTORY ---

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  await new Promise(r => setTimeout(r, DELAY));
  const txs = DB.transactions();
  // Return transactions for this user, sorted new to old
  return txs
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}