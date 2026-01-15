
export enum OrderStatus {
  PENDING = 'Pending',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  RETURNED = 'Returned'
}

export enum Courier {
  TCS = 'TCS',
  POSTEX = 'PostEx'
}

export enum ExpenseCategory {
  WIFI = 'Wifi Bill',
  RENT = 'Rent',
  LABOUR = 'Labour Cost',
  ADS = 'Ads Cost',
  PACKAGING = 'Packaging',
  MISC = 'Miscellaneous'
}

export enum CashAccount {
  MAIN = 'Main Cash',
  AD = 'Ad Cash'
}

export enum TransactionType {
  IN = 'In',
  OUT = 'Out'
}

export interface CashTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  account: CashAccount;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stockCount: number;
  lowStockThreshold: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface Worker {
  id: string;
  name: string;
  perOrderRate: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  productId: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  productId: string;
  quantity: number;
  salePrice: number;
  courier: Courier;
  status: OrderStatus;
  profit: number;
  deliveryCost: number;
  salesTax: number;
  trackingId: string;
  workerName: string; 
  workerId?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
  account: CashAccount;
}

export interface CourierPayment {
  id: string;
  date: string;
  courier: Courier;
  amount: number;
}

// User-Specific Data Bundle
export interface BusinessData {
  mainCashBalance: number;
  adCashBalance: number;
  products: Product[];
  suppliers: Supplier[];
  workers: Worker[];
  purchases: Purchase[];
  orders: Order[];
  expenses: Expense[];
  courierPayments: CourierPayment[];
  cashTransactions: CashTransaction[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  lastSeen?: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  timestamp: string;
  success: boolean;
  deviceId: string; // Added for tracking
}

export interface UserRecord {
  id: string;
  email: string;
  password?: string;
  createdAt: string;
  lastLogin?: string;
  data: BusinessData; 
}

export interface AppState {
  currentUser: AuthUser | null;
  users: UserRecord[];
  loginAttempts: LoginAttempt[];
  globalData: BusinessData; // The shared source of truth
  isSyncing: boolean;
  lastSyncTime: string | null;
}
