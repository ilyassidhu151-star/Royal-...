
import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Truck, Wallet, BarChart3, 
  LogOut, BookOpen, PieChart, UserCheck, ShieldAlert, CloudCheck, RefreshCw, Save, Menu, X 
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

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const App = () => {
  const { state, actions } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!state.currentUser) return <Login />;

  const isAdmin = state.currentUser.role === 'admin';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'ledger': return <CashLedger />;
      case 'inventory': return <Inventory />;
      case 'suppliers': return <Suppliers />;
      case 'workers': return <Workers />;
      case 'purchases': return <Purchases />;
      case 'orders': return <Orders />;
      case 'couriers': return <Couriers />;
      case 'expenses': return <Expenses />;
      case 'reports': return <Reports />;
      case 'financial': return <FinancialReports />;
      case 'worker-reports': return <WorkerReports />;
      case 'admin': return <UserAdmin />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-8">
            <h2 className="text-xl font-black text-indigo-700 tracking-tighter flex items-center gap-2">
              <Package size={24} />
              <span>ROYAL THREADS</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enterprise ERP</p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsSidebarOpen(false);}} />
            <NavItem icon={BookOpen} label="Cash Ledger" active={activeTab === 'ledger'} onClick={() => {setActiveTab('ledger'); setIsSidebarOpen(false);}} />
            <NavItem icon={Package} label="Inventory" active={activeTab === 'inventory'} onClick={() => {setActiveTab('inventory'); setIsSidebarOpen(false);}} />
            <NavItem icon={Users} label="Suppliers" active={activeTab === 'suppliers'} onClick={() => {setActiveTab('suppliers'); setIsSidebarOpen(false);}} />
            <NavItem icon={UserCheck} label="Workers" active={activeTab === 'workers'} onClick={() => {setActiveTab('workers'); setIsSidebarOpen(false);}} />
            <NavItem icon={ShoppingCart} label="Purchases" active={activeTab === 'purchases'} onClick={() => {setActiveTab('purchases'); setIsSidebarOpen(false);}} />
            <NavItem icon={ShoppingCart} label="Orders" active={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setIsSidebarOpen(false);}} />
            <NavItem icon={Truck} label="Couriers" active={activeTab === 'couriers'} onClick={() => {setActiveTab('couriers'); setIsSidebarOpen(false);}} />
            <NavItem icon={Wallet} label="Expenses" active={activeTab === 'expenses'} onClick={() => {setActiveTab('expenses'); setIsSidebarOpen(false);}} />
            <NavItem icon={BarChart3} label="Analytics" active={activeTab === 'reports'} onClick={() => {setActiveTab('reports'); setIsSidebarOpen(false);}} />
            
            {isAdmin && (
              <>
                <div className="pt-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Control</div>
                <NavItem icon={PieChart} label="Financials" active={activeTab === 'financial'} onClick={() => {setActiveTab('financial'); setIsSidebarOpen(false);}} />
                <NavItem icon={UserCheck} label="Worker Payroll" active={activeTab === 'worker-reports'} onClick={() => {setActiveTab('worker-reports'); setIsSidebarOpen(false);}} />
                <NavItem icon={ShieldAlert} label="User Logs" active={activeTab === 'admin'} onClick={() => {setActiveTab('admin'); setIsSidebarOpen(false);}} />
              </>
            )}
          </nav>

          <div className="pt-6 border-t mt-4 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {state.currentUser.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{state.currentUser.email}</p>
                <p className="text-[10px] text-indigo-500 font-bold uppercase">{state.currentUser.role}</p>
              </div>
            </div>
            <button onClick={() => actions.logout()} className="w-full flex items-center gap-3 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition text-sm font-bold">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-gray-500" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-indigo-700 capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
              {state.isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <CloudCheck size={14} />}
              <span>{state.lastSyncTime ? `Last Sync: ${new Date(state.lastSyncTime).toLocaleTimeString()}` : 'Not Synced'}</span>
            </div>
            <button 
              onClick={() => actions.saveToCloud()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
            >
              <Save size={16} />
              <span className="hidden md:inline">Save To Cloud</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
