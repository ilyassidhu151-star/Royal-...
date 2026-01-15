
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  BarChart3,
  LogOut,
  Menu,
  X,
  BookOpen,
  PieChart,
  UserCheck,
  ShieldAlert,
  CloudCheck,
  RefreshCw,
  Save
} from 'lucide-react';
import { useStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Suppliers from './components/Suppliers';
import Workers from './components/Workers';
import Purchases from './components/Purchases';
import Orders from './components/Orders';
import Expenses from './components/Expenses';
import Couriers from './components/Couriers';
import Reports from './components/Reports';
import FinancialReports from './components/FinancialReports';
import WorkerReports from './components/WorkerReports';
import CashLedger from './components/CashLedger';
import UserAdmin from './components/UserAdmin';

const SidebarItem = ({ to, icon: Icon, label, active, onClick }: { to: string, icon: any, label: string, active: boolean, onClick?: () => void, key?: React.Key }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      active ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const AppLayout = () => {
  const { state, actions } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const location = useLocation();

  if (!state.currentUser) {
    return <Login />;
  }

  const isAdmin = state.currentUser.role === 'admin';

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ledger', icon: BookOpen, label: 'Cash Ledger' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/suppliers', icon: Users, label: 'Suppliers' },
    { to: '/workers', icon: UserCheck, label: 'Workers' },
    { to: '/purchases', icon: ShoppingCart, label: 'Purchases' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/couriers', icon: Truck, label: 'Couriers' },
    { to: '/expenses', icon: Wallet, label: 'Expenses' },
    { to: '/reports', icon: BarChart3, label: 'Order Reports' },
    { to: '/financial', icon: PieChart, label: 'Financial Reports' },
    { to: '/worker-reports', icon: UserCheck, label: 'Worker Reports' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/user-management', icon: ShieldAlert, label: 'User Admin' });
  }

  const handleSave = async () => {
    setSaveStatus('Saving to Cloud...');
    try {
      await actions.saveGlobalData();
      setSaveStatus('Data Saved Successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus('Save Failed. Check Connection.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-30 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-700 flex flex-col leading-tight">
            <span className="flex items-center space-x-2">
              <Package size={20} />
              <span>Royal Threads</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-widest mt-1">ENTERPRISE ERP</span>
          </h1>
          
          <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{state.currentUser.email}</p>
            <div className="flex justify-between items-center mt-1">
              <p className={`text-[9px] font-black uppercase tracking-tighter ${isAdmin ? 'text-indigo-600' : 'text-gray-500'}`}>
                {state.currentUser.role === 'admin' ? '★ Administrator' : 'Staff Member'}
              </p>
              {state.isSyncing ? (
                <RefreshCw size={10} className="animate-spin text-blue-500" />
              ) : (
                <CloudCheck size={10} className="text-emerald-500" />
              )}
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={state.isSyncing}
            className={`mt-4 w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              saveStatus === 'Data Saved Successfully!' 
                ? 'bg-emerald-600 text-white shadow-emerald-100' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {state.isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saveStatus || 'Save to Cloud'}</span>
          </button>
        </div>
        
        <nav className="px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
              onClick={() => setIsSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-white">
          <button 
            onClick={() => actions.logout()}
            className="flex items-center space-x-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex justify-between items-center md:hidden">
          <h1 className="text-lg font-bold text-indigo-700 leading-none">Royal Threads</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="p-4 md:p-8 overflow-x-hidden">
          {saveStatus && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm font-bold animate-in slide-in-from-top-4 duration-300 ${saveStatus.includes('Successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              <CloudCheck size={18} />
              <span>{saveStatus}</span>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ledger" element={<CashLedger />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/couriers" element={<Couriers />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/financial" element={<FinancialReports />} />
            <Route path="/worker-reports" element={<WorkerReports />} />
            {isAdmin && <Route path="/user-management" element={<UserAdmin />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
};

export default App;
