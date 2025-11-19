import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { User, UserRole } from './types';
import { loginService, registerService } from './services/mockBackend';
import { Toaster, toast } from 'react-hot-toast';
import { LayoutDashboard, Wallet, ShoppingBag, Lock, User as UserIcon, LogOut, ShieldCheck, Menu, X, History } from 'lucide-react';

// --- Pages Imports ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BuyDataPage from './pages/BuyDataPage';
import WalletPage from './pages/WalletPage';
import AdminPage from './pages/AdminPage';
import DeveloperPage from './pages/DeveloperPage';
import HistoryPage from './pages/HistoryPage';

// --- Context ---

interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  refreshUser: (u: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('session_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('session_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('session_user');
  };

  const refreshUser = (userData: User) => {
      setUser(userData);
      localStorage.setItem('session_user', JSON.stringify(userData));
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Layout Components ---

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 lg:hidden text-slate-600 dark:text-slate-300">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 font-bold text-xl text-primary-600 dark:text-primary-400">
            <ShieldCheck className="w-8 h-8" />
            <span>DataMart Premium</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium dark:text-white">{user?.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">GHS {user?.walletBalance.toFixed(2)}</p>
        </div>
        <button onClick={logout} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

const Sidebar = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/buy', icon: ShoppingBag, label: 'Buy Data' },
    { to: '/history', icon: History, label: 'Transactions' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/developer', icon: Lock, label: 'Developer' },
  ];

  if (user?.role === UserRole.ADMIN) {
    links.push({ to: '/admin', icon: ShieldCheck, label: 'Admin Panel' });
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={close} />}
      
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-bold dark:text-white">Menu</span>
          <button onClick={close}><X size={24} /></button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => window.innerWidth < 1024 && close()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
             <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Wallet Balance</div>
             <div className="text-xl font-bold text-slate-800 dark:text-white">GHS {user?.walletBalance.toFixed(2)}</div>
             <Link to="/wallet" className="block mt-2 text-xs text-primary-600 hover:underline">Top up via Paystack</Link>
        </div>
      </aside>
    </>
  );
};

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Sidebar isOpen={sidebarOpen} close={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: UserRole }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/dashboard" />;
  
  return <PrivateLayout>{children}</PrivateLayout>;
};

// --- Main App Component ---
const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/buy" element={
            <ProtectedRoute>
              <BuyDataPage />
            </ProtectedRoute>
          } />
          
          <Route path="/wallet" element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />

          <Route path="/developer" element={
            <ProtectedRoute>
              <DeveloperPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute role={UserRole.ADMIN}>
              <AdminPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;