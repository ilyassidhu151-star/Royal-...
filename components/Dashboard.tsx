
import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Clock, 
  Truck, 
  AlertTriangle,
  Wallet,
  CreditCard,
  Scan
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { OrderStatus } from '../types';
import ScannerOverlay from './ScannerOverlay';

const KpiCard = ({ title, value, icon: Icon, color, subValue }: { title: string, value: string, icon: any, color: string, subValue?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { state, computed } = useStore();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const chartData = [
    { name: 'Purchases', value: computed.totalPurchases, color: '#6366f1' },
    { name: 'Sales', value: computed.totalSales, color: '#10b981' },
    { name: 'Expenses', value: computed.totalExpenses, color: '#f43f5e' },
    { name: 'Net Profit', value: computed.netProfit, color: '#0ea5e9' },
  ];

  const pendingOrders = state.orders.filter(o => o.status === OrderStatus.PENDING).length;
  const deliveredOrders = state.orders.filter(o => o.status === OrderStatus.DELIVERED).length;
  const returnedOrders = state.orders.filter(o => o.status === OrderStatus.RETURNED).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <div className="flex space-x-6 mt-1">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black">Main Cash</p>
              <p className="text-md font-bold text-indigo-600">PKR {state.mainCashBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black">Ad Cash</p>
              <p className="text-md font-bold text-sky-500">PKR {state.adCashBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center space-x-3 hover:bg-indigo-800 transition shadow-xl shadow-indigo-200 border-2 border-indigo-500"
        >
          <Scan size={20} />
          <span className="font-bold">Scan Label (TCS/PostEx)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Purchases" 
          value={`PKR ${computed.totalPurchases.toLocaleString()}`} 
          icon={ShoppingCart} 
          color="bg-indigo-500" 
        />
        <KpiCard 
          title="Total Sales" 
          value={`PKR ${computed.totalSales.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
          subValue="(Delivered Orders)"
        />
        <KpiCard 
          title="Net Profit/Loss" 
          value={`PKR ${computed.netProfit.toLocaleString()}`} 
          icon={computed.netProfit >= 0 ? TrendingUp : TrendingDown} 
          color={computed.netProfit >= 0 ? "bg-sky-500" : "bg-rose-500"} 
        />
        <KpiCard 
          title="Stock Value" 
          value={`PKR ${computed.currentStockValue.toLocaleString()}`} 
          icon={Package} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Financial Summary</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  formatter={(value: number) => `PKR ${value.toLocaleString()}`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800">Order & Stock Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="text-blue-600" size={20} />
                <span className="font-medium text-blue-900">Pending Orders</span>
              </div>
              <span className="text-xl font-bold text-blue-700">{pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Truck className="text-green-600" size={20} />
                <span className="font-medium text-green-900">Delivered</span>
              </div>
              <span className="text-xl font-bold text-green-700">{deliveredOrders}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-red-600" size={20} />
                <span className="font-medium text-red-900">Returns</span>
              </div>
              <span className="text-xl font-bold text-red-700">{returnedOrders}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Low Stock Alerts</h4>
            {computed.lowStockProducts.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {computed.lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="font-bold text-rose-500">{p.stockCount} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No low stock alerts</p>
            )}
          </div>
        </div>
      </div>

      <ScannerOverlay isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};

export default Dashboard;
