
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';

import { 
  AppState, Product, Supplier, Worker, Purchase, Order, Expense, 
  CourierPayment, OrderStatus, CashAccount, TransactionType, 
  CashTransaction, BusinessData, Courier, AuthUser, UserRecord, LoginAttempt
} from './types';

// NOTE: User must replace this with their actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAs-Placeholder-Key",
  authDomain: "royalthreads-erp.firebaseapp.com",
  projectId: "royalthreads-erp",
  storageBucket: "royalthreads-erp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const isFirebaseConfigured = !firebaseConfig.apiKey.includes("Placeholder");

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization failed. Using local mode.");
}

const ADMIN_EMAIL = 'royalthreads.pvt@gmail.com';
const DEMO_STAFF_EMAIL = 'ilyassidhu151@gmail.com';

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
  state: AppState & BusinessData;
  actions: {
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (email: string, password: string) => Promise<boolean>;
    saveGlobalData: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id' | 'stockCount'>) => void;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    addWorker: (worker: Omit<Worker, 'id'>) => void;
    updateWorker: (id: string, updates: Partial<Worker>) => void;
    removeWorker: (id: string) => void;
    addPurchase: (purchase: Omit<Purchase, 'id' | 'total'>) => void;
    addOrder: (order: Omit<Order, 'id' | 'profit' | 'deliveryCost' | 'salesTax' | 'orderNumber'>) => void;
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
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [isMockSession, setIsMockSession] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('royal_threads_data');
    if (savedData) {
      try {
        setGlobalData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local data", e);
      }
    }

    const mockUser = sessionStorage.getItem('royal_threads_mock_user');
    if (mockUser) {
      setCurrentUser(JSON.parse(mockUser));
      setIsMockSession(true);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || isMockSession) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsSyncing(true);
        const authUser: AuthUser = {
          id: user.uid,
          email: user.email || '',
          role: user.email === ADMIN_EMAIL ? 'admin' : 'user',
          lastSeen: new Date().toISOString()
        };
        setCurrentUser(authUser);

        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setGlobalData(docSnap.data().data);
            setLastSyncTime(new Date().toISOString());
          } else {
            const initialData = createEmptyBusinessData();
            await setDoc(docRef, {
              email: user.email,
              role: authUser.role,
              data: initialData,
              createdAt: new Date().toISOString()
            });
            setGlobalData(initialData);
          }
        } catch (err) {
          console.error("Error loading user data:", err);
        } finally {
          setIsSyncing(false);
        }
      } else {
        if (!isMockSession) {
          setCurrentUser(null);
          setGlobalData(createEmptyBusinessData());
        }
      }
    });
    return () => unsubscribe();
  }, [isMockSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsSyncing(true);
    
    // Bypass logic for Demo Credentials
    const isDemoAdmin = email === ADMIN_EMAIL && password === '033148';
    const isDemoStaff = email === DEMO_STAFF_EMAIL && password === '151151';

    if (isDemoAdmin || isDemoStaff) {
      const mockUser: AuthUser = {
        id: isDemoAdmin ? 'demo-admin' : 'demo-staff',
        email: email,
        role: isDemoAdmin ? 'admin' : 'user',
        lastSeen: new Date().toISOString()
      };
      setCurrentUser(mockUser);
      setIsMockSession(true);
      sessionStorage.setItem('royal_threads_mock_user', JSON.stringify(mockUser));
      setIsSyncing(false);
      return true;
    }

    if (!isFirebaseConfigured) {
      setIsSyncing(false);
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      setIsSyncing(false);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    if (!isFirebaseConfigured) return false;
    setIsSyncing(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Register Error:", error);
      setIsSyncing(false);
      return false;
    }
  };

  const logout = () => {
    if (isFirebaseConfigured) signOut(auth);
    setCurrentUser(null);
    setIsMockSession(false);
    sessionStorage.removeItem('royal_threads_mock_user');
  };

  const saveGlobalData = async () => {
    if (!currentUser) return;
    setIsSyncing(true);

    // Always save to local storage as safety
    localStorage.setItem('royal_threads_data', JSON.stringify(globalData));

    if (!isFirebaseConfigured || isMockSession) {
      setLastSyncTime(new Date().toISOString());
      setIsSyncing(false);
      console.log("Local Save Successful (Firebase Bypassed)");
      return;
    }

    try {
      const docRef = doc(db, "users", currentUser.id);
      await updateDoc(docRef, {
        data: globalData,
        lastSync: new Date().toISOString()
      });
      setLastSyncTime(new Date().toISOString());
      console.log("Cloud Save Successful");
    } catch (error) {
      console.error("Cloud Save Failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const actions = {
    login,
    logout,
    register,
    saveGlobalData,
    addProduct: (product: Omit<Product, 'id' | 'stockCount'>) => {
      setGlobalData(prev => ({
        ...prev,
        products: [...prev.products, { ...product, id: crypto.randomUUID(), stockCount: 0 }]
      }));
    },
    addSupplier: (supplier: Omit<Supplier, 'id'>) => {
      setGlobalData(prev => ({
        ...prev,
        suppliers: [...prev.suppliers, { ...supplier, id: crypto.randomUUID() }]
      }));
    },
    addWorker: (worker: Omit<Worker, 'id'>) => {
      setGlobalData(prev => ({
        ...prev,
        workers: [...prev.workers, { ...worker, id: crypto.randomUUID() }]
      }));
    },
    updateWorker: (id: string, updates: Partial<Worker>) => {
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
    addPurchase: (purchase: Omit<Purchase, 'id' | 'total'>) => {
      const total = purchase.quantity * purchase.rate;
      setGlobalData(prev => {
        const updatedProducts = prev.products.map(p => 
          p.id === purchase.productId ? { ...p, stockCount: p.stockCount + purchase.quantity } : p
        );
        const ledgerEntry: CashTransaction = {
          id: crypto.randomUUID(),
          date: purchase.date,
          description: `Purchase: ${updatedProducts.find(p => p.id === purchase.productId)?.name}`,
          amount: total,
          type: TransactionType.OUT,
          account: CashAccount.MAIN
        };
        return {
          ...prev,
          purchases: [...prev.purchases, { ...purchase, id: crypto.randomUUID(), total }],
          products: updatedProducts,
          mainCashBalance: prev.mainCashBalance - total,
          cashTransactions: [...prev.cashTransactions, ledgerEntry]
        };
      });
    },
    addOrder: (order: Omit<Order, 'id' | 'profit' | 'deliveryCost' | 'salesTax' | 'orderNumber'>) => {
      const orderNumber = `RT-${(globalData.orders.length + 1).toString().padStart(5, '0')}`;
      setGlobalData(prev => {
        const updatedProducts = prev.products.map(p => 
          p.id === order.productId ? { ...p, stockCount: p.stockCount - order.quantity } : p
        );
        return {
          ...prev,
          orders: [...prev.orders, { ...order, id: crypto.randomUUID(), orderNumber, profit: 0, deliveryCost: 0, salesTax: 0 }],
          products: updatedProducts
        };
      });
    },
    updateOrderStatus: (orderId: string, newStatus: OrderStatus, costing?: { deliveryCost: number, salesTax: number }) => {
      setGlobalData(prev => {
        const order = prev.orders.find(o => o.id === orderId);
        if (!order) return prev;

        let updatedProducts = [...prev.products];
        let updatedProfit = order.profit;

        if (newStatus === OrderStatus.RETURNED && order.status !== OrderStatus.RETURNED) {
          updatedProducts = updatedProducts.map(p => p.id === order.productId ? { ...p, stockCount: p.stockCount + order.quantity } : p);
        } else if (order.status === OrderStatus.RETURNED && newStatus !== OrderStatus.RETURNED) {
           updatedProducts = updatedProducts.map(p => p.id === order.productId ? { ...p, stockCount: p.stockCount - order.quantity } : p);
        }

        if (newStatus === OrderStatus.DELIVERED && costing) {
          const product = prev.products.find(p => p.id === order.productId);
          const totalRevenue = order.salePrice * order.quantity;
          const totalCost = ((product?.costPrice || 0) * order.quantity) + costing.deliveryCost + costing.salesTax;
          updatedProfit = totalRevenue - totalCost;
        }

        return {
          ...prev,
          products: updatedProducts,
          orders: prev.orders.map(o => o.id === orderId ? { 
            ...o, 
            status: newStatus, 
            profit: newStatus === OrderStatus.DELIVERED ? (costing ? updatedProfit : o.profit) : 0,
            deliveryCost: costing?.deliveryCost || o.deliveryCost,
            salesTax: costing?.salesTax || o.salesTax
          } : o)
        };
      });
    },
    updateOrderTracking: (orderId: string, newTrackingId: string) => {
      setGlobalData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === orderId ? { ...o, trackingId: newTrackingId } : o)
      }));
    },
    addExpense: (expense: Omit<Expense, 'id'>) => {
      setGlobalData(prev => {
        const ledgerEntry: CashTransaction = {
          id: crypto.randomUUID(),
          date: expense.date,
          description: `Expense: ${expense.category} - ${expense.note}`,
          amount: expense.amount,
          type: TransactionType.OUT,
          account: expense.account
        };
        return {
          ...prev,
          expenses: [...prev.expenses, { ...expense, id: crypto.randomUUID() }],
          mainCashBalance: expense.account === CashAccount.MAIN ? prev.mainCashBalance - expense.amount : prev.mainCashBalance,
          adCashBalance: expense.account === CashAccount.AD ? prev.adCashBalance - expense.amount : prev.adCashBalance,
          cashTransactions: [...prev.cashTransactions, ledgerEntry]
        };
      });
    },
    addCourierPayment: (payment: Omit<CourierPayment, 'id'>) => {
      setGlobalData(prev => {
        const ledgerEntry: CashTransaction = {
          id: crypto.randomUUID(),
          date: payment.date,
          description: `Courier Payment: ${payment.courier}`,
          amount: payment.amount,
          type: TransactionType.IN,
          account: CashAccount.MAIN
        };
        return {
          ...prev,
          courierPayments: [...prev.courierPayments, { ...payment, id: crypto.randomUUID() }],
          mainCashBalance: prev.mainCashBalance + payment.amount,
          cashTransactions: [...prev.cashTransactions, ledgerEntry]
        };
      });
    },
    processScanData: (barcode: string): { message: string, type: 'NEW' | 'RETURN' | 'ERROR' } => {
      const order = globalData.orders.find(o => o.trackingId === barcode);
      if (!order) return { message: `Tracking ID ${barcode} not found.`, type: 'ERROR' };

      if (order.status === OrderStatus.PENDING) {
        actions.updateOrderStatus(order.id, OrderStatus.SHIPPED);
        return { message: `Order ${order.orderNumber} (Pending -> Shipped)`, type: 'NEW' };
      } else if (order.status === OrderStatus.SHIPPED) {
        actions.updateOrderStatus(order.id, OrderStatus.RETURNED);
        return { message: `Order ${order.orderNumber} (Shipped -> Returned)`, type: 'RETURN' };
      } else {
        return { message: `Order ${order.orderNumber} is already ${order.status}.`, type: 'ERROR' };
      }
    },
    addLedgerEntry: (entry: Omit<CashTransaction, 'id'>) => {
      setGlobalData(prev => {
        const isMain = entry.account === CashAccount.MAIN;
        const isAd = entry.account === CashAccount.AD;
        const isDelta = entry.type === TransactionType.IN ? entry.amount : -entry.amount;
        return {
          ...prev,
          mainCashBalance: isMain ? prev.mainCashBalance + isDelta : prev.mainCashBalance,
          adCashBalance: isAd ? prev.adCashBalance + isDelta : prev.adCashBalance,
          cashTransactions: [...prev.cashTransactions, { ...entry, id: crypto.randomUUID() }]
        };
      });
    }
  };

  const totalSales = globalData.orders
    .filter(o => o.status === OrderStatus.DELIVERED)
    .reduce((acc, o) => acc + (o.salePrice * o.quantity), 0);

  const totalPurchases = globalData.purchases.reduce((acc, p) => acc + p.total, 0);
  const totalExpenses = globalData.expenses.reduce((acc, e) => acc + e.amount, 0);
  const cogs = globalData.orders
    .filter(o => o.status === OrderStatus.DELIVERED)
    .reduce((acc, o) => {
      const p = globalData.products.find(prod => prod.id === o.productId);
      return acc + ((p?.costPrice || 0) * o.quantity);
    }, 0);

  const netProfit = totalSales - cogs - totalExpenses;

  const computed = {
    totalSales,
    totalPurchases,
    totalExpenses,
    netProfit,
    cogs,
    currentStockValue: globalData.products.reduce((acc, p) => acc + (p.stockCount * p.costPrice), 0),
    lowStockProducts: globalData.products.filter(p => p.stockCount <= p.lowStockThreshold),
    getCourierReceivable: (courier: string) => {
      const delivered = globalData.orders
        .filter(o => o.courier === courier && o.status === OrderStatus.DELIVERED)
        .reduce((acc, o) => acc + (o.salePrice * o.quantity), 0);
      const payments = globalData.courierPayments
        .filter(p => p.courier === courier)
        .reduce((acc, p) => acc + p.amount, 0);
      return delivered - payments;
    }
  };

  const state: AppState = {
    currentUser,
    users: allUsers,
    loginAttempts: loginAttempts,
    globalData: globalData,
    isSyncing,
    lastSyncTime
  };

  return React.createElement(
    StoreContext.Provider,
    { value: { state: { ...state, ...globalData }, actions, computed } },
    children
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
