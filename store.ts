
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  OrderStatus, CashAccount, TransactionType, 
  BusinessData, Courier, AuthUser, Product, Supplier, Worker, 
  Purchase, Order, Expense, CourierPayment, CashTransaction 
} from './types';

const ADMIN_EMAIL = 'royalthreads.pvt@gmail.com';
const STAFF_EMAIL = 'ilyassidhu151@gmail.com';

const createEmptyBusinessData = (): BusinessData => ({
  mainCashBalance: 50000,
  adCashBalance: 0,
  products: [],
  suppliers: [],
  workers: [],
  purchases: [],
  orders: [],
  expenses: [],
  courierPayments: [],
  cashTransactions: [{
    id: 'initial',
    date: new Date().toISOString().split('T')[0],
    description: 'Starting Balance',
    amount: 50000,
    type: TransactionType.IN,
    account: CashAccount.MAIN
  }]
});

interface StoreContextType {
  state: BusinessData & { currentUser: AuthUser | null; isSyncing: boolean; lastSyncTime: string | null };
  actions: {
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    saveToCloud: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id' | 'stockCount'>) => void;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    addWorker: (worker: Omit<Worker, 'id'>) => void;
    updateWorker: (id: string, updates: Partial<Worker>) => void;
    removeWorker: (id: string) => void;
    addPurchase: (purchase: Omit<Purchase, 'id' | 'total'>) => void;
    addOrder: (order: Omit<Order, 'id' | 'profit' | 'deliveryCost' | 'salesTax' | 'orderNumber' | 'workerName'>) => void;
    updateOrderStatus: (orderId: string, newStatus: OrderStatus, costing?: { deliveryCost: number, salesTax: number }) => void;
    updateOrderTracking: (orderId: string, newTrackingId: string) => void;
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    addCourierPayment: (payment: Omit<CourierPayment, 'id'>) => void;
    processScanData: (barcode: string) => { message: string, type: 'NEW' | 'RETURN' | 'ERROR' };
    addLedgerEntry: (entry: Omit<CashTransaction, 'id'>) => void;
  };
  computed: {
    totalSales: number;
    totalPurchases: number;
    totalExpenses: number;
    netProfit: number;
    cogs: number;
    currentStockValue: number;
    lowStockProducts: Product[];
    getCourierReceivable: (courier: string) => number;
  };
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [globalData, setGlobalData] = useState<BusinessData>(createEmptyBusinessData());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('royal_threads_v3');
    if (savedData) setGlobalData(JSON.parse(savedData));
    
    const savedUser = sessionStorage.getItem('royal_threads_session');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const isAdmin = email === ADMIN_EMAIL && password === '033148';
    const isStaff = email === STAFF_EMAIL && password === '151151';

    if (isAdmin || isStaff) {
      const user: AuthUser = {
        id: isAdmin ? 'admin-01' : 'staff-01',
        email,
        role: isAdmin ? 'admin' : 'user',
        lastSeen: new Date().toISOString()
      };
      setCurrentUser(user);
      sessionStorage.setItem('royal_threads_session', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('royal_threads_session');
  };

  const saveToCloud = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    // Simulate cloud sync - in Vercel this would call /api/sync
    localStorage.setItem('royal_threads_v3', JSON.stringify(globalData));
    setLastSyncTime(new Date().toISOString());
    setTimeout(() => setIsSyncing(false), 800);
  };

  const actions = {
    login,
    logout,
    saveToCloud,
    addProduct: (product: any) => {
      setGlobalData(prev => ({
        ...prev,
        products: [...prev.products, { ...product, id: crypto.randomUUID(), stockCount: 0 }]
      }));
    },
    addSupplier: (supplier: any) => {
      setGlobalData(prev => ({
        ...prev,
        suppliers: [...prev.suppliers, { ...supplier, id: crypto.randomUUID() }]
      }));
    },
    addWorker: (worker: any) => {
      setGlobalData(prev => ({
        ...prev,
        workers: [...prev.workers, { ...worker, id: crypto.randomUUID() }]
      }));
    },
    updateWorker: (id: string, updates: any) => {
      setGlobalData(prev => ({
        ...prev,
        workers: prev.workers.map(w => w.id === id ? { ...w, ...updates } : w)
      }));
    },
    removeWorker: (id: string) => {
      setGlobalData(prev => ({
        ...prev,
        workers: prev.workers.filter(w => w.id !== id)
      }));
    },
    addPurchase: (purchase: any) => {
      const total = purchase.quantity * purchase.rate;
      setGlobalData(prev => {
        const prod = prev.products.find(p => p.id === purchase.productId);
        const tx: CashTransaction = {
          id: crypto.randomUUID(),
          date: purchase.date,
          description: `Stock In: ${prod?.name}`,
          amount: total,
          type: TransactionType.OUT,
          account: CashAccount.MAIN
        };
        return {
          ...prev,
          products: prev.products.map(p => p.id === purchase.productId ? { ...p, stockCount: p.stockCount + purchase.quantity } : p),
          purchases: [...prev.purchases, { ...purchase, id: crypto.randomUUID(), total }],
          mainCashBalance: prev.mainCashBalance - total,
          cashTransactions: [...prev.cashTransactions, tx]
        };
      });
    },
    addOrder: (order: any) => {
      const orderNumber = `RT-${(globalData.orders.length + 1).toString().padStart(5, '0')}`;
      const worker = globalData.workers.find(w => w.id === order.workerId);
      setGlobalData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === order.productId ? { ...p, stockCount: Math.max(0, p.stockCount - order.quantity) } : p),
        orders: [...prev.orders, { ...order, id: crypto.randomUUID(), orderNumber, workerName: worker?.name || 'Unknown', profit: 0, deliveryCost: 0, salesTax: 0 }]
      }));
    },
    updateOrderStatus: (orderId: string, newStatus: OrderStatus, costing?: any) => {
      setGlobalData(prev => {
        const order = prev.orders.find(o => o.id === orderId);
        if (!order) return prev;
        
        let products = [...prev.products];
        if (newStatus === OrderStatus.RETURNED && order.status !== OrderStatus.RETURNED) {
          products = products.map(p => p.id === order.productId ? { ...p, stockCount: p.stockCount + order.quantity } : p);
        }

        let profit = 0;
        if (newStatus === OrderStatus.DELIVERED && costing) {
          const product = prev.products.find(p => p.id === order.productId);
          profit = (order.salePrice * order.quantity) - ((product?.costPrice || 0) * order.quantity) - costing.deliveryCost - costing.salesTax;
        }

        return {
          ...prev,
          products,
          orders: prev.orders.map(o => o.id === orderId ? { ...o, status: newStatus, profit, ...costing } : o)
        };
      });
    },
    updateOrderTracking: (orderId: string, newTrackingId: string) => {
      setGlobalData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === orderId ? { ...o, trackingId: newTrackingId } : o)
      }));
    },
    addExpense: (expense: any) => {
      setGlobalData(prev => ({
        ...prev,
        expenses: [...prev.expenses, { ...expense, id: crypto.randomUUID() }],
        mainCashBalance: expense.account === CashAccount.MAIN ? prev.mainCashBalance - expense.amount : prev.mainCashBalance,
        adCashBalance: expense.account === CashAccount.AD ? prev.adCashBalance - expense.amount : prev.adCashBalance,
        cashTransactions: [...prev.cashTransactions, {
          id: crypto.randomUUID(),
          date: expense.date,
          description: `Exp: ${expense.category}`,
          amount: expense.amount,
          type: TransactionType.OUT,
          account: expense.account
        }]
      }));
    },
    addCourierPayment: (payment: any) => {
      setGlobalData(prev => ({
        ...prev,
        courierPayments: [...prev.courierPayments, { ...payment, id: crypto.randomUUID() }],
        mainCashBalance: prev.mainCashBalance + payment.amount,
        cashTransactions: [...prev.cashTransactions, {
          id: crypto.randomUUID(),
          date: payment.date,
          description: `Collect: ${payment.courier}`,
          amount: payment.amount,
          type: TransactionType.IN,
          account: CashAccount.MAIN
        }]
      }));
    },
    processScanData: (barcode: string) => {
      const order = globalData.orders.find(o => o.trackingId === barcode);
      if (!order) return { message: 'Parcel Not Found', type: 'ERROR' as const };
      
      if (order.status === OrderStatus.PENDING) {
        actions.updateOrderStatus(order.id, OrderStatus.SHIPPED);
        return { message: `Order ${order.orderNumber} -> SHIPPED`, type: 'NEW' as const };
      } else if (order.status === OrderStatus.SHIPPED) {
        actions.updateOrderStatus(order.id, OrderStatus.RETURNED);
        return { message: `Order ${order.orderNumber} -> RETURNED`, type: 'RETURN' as const };
      }
      return { message: `Order is ${order.status}`, type: 'ERROR' as const };
    },
    addLedgerEntry: (entry: any) => {
      setGlobalData(prev => {
        const delta = entry.type === TransactionType.IN ? entry.amount : -entry.amount;
        return {
          ...prev,
          mainCashBalance: entry.account === CashAccount.MAIN ? prev.mainCashBalance + delta : prev.mainCashBalance,
          adCashBalance: entry.account === CashAccount.AD ? prev.adCashBalance + delta : prev.adCashBalance,
          cashTransactions: [...prev.cashTransactions, { ...entry, id: crypto.randomUUID() }]
        };
      });
    }
  };

  const totalSales = globalData.orders.filter(o => o.status === OrderStatus.DELIVERED).reduce((acc, o) => acc + (o.salePrice * o.quantity), 0);
  const totalPurchases = globalData.purchases.reduce((acc, p) => acc + p.total, 0);
  const totalExpenses = globalData.expenses.reduce((acc, e) => acc + e.amount, 0);
  const cogs = globalData.orders.filter(o => o.status === OrderStatus.DELIVERED).reduce((acc, o) => {
    const p = globalData.products.find(prod => prod.id === o.productId);
    return acc + ((p?.costPrice || 0) * o.quantity);
  }, 0);

  const computed = {
    totalSales,
    totalPurchases,
    totalExpenses,
    netProfit: totalSales - cogs - totalExpenses,
    cogs,
    currentStockValue: globalData.products.reduce((acc, p) => acc + (p.stockCount * p.costPrice), 0),
    lowStockProducts: globalData.products.filter(p => p.stockCount <= p.lowStockThreshold),
    getCourierReceivable: (courier: string) => {
      const delivered = globalData.orders.filter(o => o.courier === courier && o.status === OrderStatus.DELIVERED).reduce((acc, o) => acc + (o.salePrice * o.quantity), 0);
      const paid = globalData.courierPayments.filter(p => p.courier === courier).reduce((acc, p) => acc + p.amount, 0);
      return delivered - paid;
    }
  };

  return React.createElement(StoreContext.Provider, { 
    value: { state: { ...globalData, currentUser, isSyncing, lastSyncTime }, actions, computed } 
  }, children);
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
