
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  PieChart, 
  Printer, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  ShoppingCart, 
  Wallet, 
  X,
  User,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { OrderStatus } from '../types';

type FilterType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const FinancialReports = () => {
  const { state } = useStore();
  
  // Filter States
  const [filterType, setFilterType] = useState<FilterType>('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWorker, setSelectedWorker] = useState<string>('All Workers');
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);

  const workers = useMemo(() => {
    const uniqueWorkers = Array.from(new Set(state.orders.map(o => o.workerName).filter(Boolean)));
    return ['All Workers', ...uniqueWorkers];
  }, [state.orders]);

  const financialData = useMemo(() => {
    const isWithinRange = (dateStr: string) => {
      const d = new Date(dateStr);
      if (filterType === 'daily') return dateStr === startDate;
      if (filterType === 'weekly' || filterType === 'custom') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return d >= start && d <= end;
      }
      if (filterType === 'monthly') return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      if (filterType === 'yearly') return d.getFullYear() === selectedYear;
      return true;
    };

    const filteredOrders = state.orders.filter(o => {
      const dateMatch = isWithinRange(o.date);
      const workerMatch = selectedWorker === 'All Workers' || o.workerName === selectedWorker;
      return dateMatch && workerMatch;
    });

    const filteredPurchases = state.purchases.filter(p => isWithinRange(p.date));
    const filteredExpenses = state.expenses.filter(e => isWithinRange(e.date));

    const totalSales = filteredOrders
      .filter(o => o.status === OrderStatus.DELIVERED)
      .reduce((acc, o) => acc + (o.salePrice * o.quantity), 0);

    const totalPurchases = filteredPurchases.reduce((acc, p) => acc + p.total, 0);
    const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const profit = totalSales - totalPurchases - totalExpenses;

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      profit,
      orderCount: filteredOrders.length,
      purchaseCount: filteredPurchases.length,
      expenseCount: filteredExpenses.length
    };
  }, [state, filterType, startDate, endDate, selectedMonth, selectedYear, selectedWorker]);

  const StatBox = ({ title, value, icon: Icon, color, detail }: { title: string, value: string, icon: any, color: string, detail: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} text-white`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
      </div>
      <div className="text-xs font-bold text-gray-400 flex items-center">
        <ChevronRight size={12} className="mr-1" />
        {detail}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Financial Reports</h2>
          <p className="text-gray-500">Comprehensive profit and loss statement with custom time-filtering.</p>
        </div>
        <button 
          onClick={() => setIsPrintViewOpen(true)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition shadow-xl shadow-indigo-200"
        >
          <Printer size={20} />
          <span>Print Financial Statement</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-6 no-print">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Filter Basis</label>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as FilterType[]).map((type) => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition ${filterType === type ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {(filterType === 'daily' || filterType === 'weekly' || filterType === 'custom') && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">
              {filterType === 'daily' ? 'Date' : 'Start Date'}
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-[40px]"
            />
          </div>
        )}

        {(filterType === 'weekly' || filterType === 'custom') && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-[40px]"
            />
          </div>
        )}

        {filterType === 'monthly' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Month</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-[40px]"
            >
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {(filterType === 'monthly' || filterType === 'yearly') && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Year</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-[40px]"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Staff Member</label>
          <select 
            value={selectedWorker} 
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-[40px]"
          >
            {workers.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        <StatBox 
          title="Total Sales" 
          value={`PKR ${financialData.totalSales.toLocaleString()}`} 
          icon={ShoppingBag} 
          color="bg-emerald-500" 
          detail={`From ${financialData.orderCount} total orders`}
        />
        <StatBox 
          title="Total Purchases" 
          value={`PKR ${financialData.totalPurchases.toLocaleString()}`} 
          icon={ShoppingCart} 
          color="bg-indigo-500" 
          detail={`From ${financialData.purchaseCount} purchase entries`}
        />
        <StatBox 
          title="Total Expenses" 
          value={`PKR ${financialData.totalExpenses.toLocaleString()}`} 
          icon={Wallet} 
          color="bg-rose-500" 
          detail={`Across ${financialData.expenseCount} billing records`}
        />
        <StatBox 
          title="Net Profit" 
          value={`PKR ${financialData.profit.toLocaleString()}`} 
          icon={financialData.profit >= 0 ? TrendingUp : TrendingDown} 
          color={financialData.profit >= 0 ? "bg-sky-500" : "bg-red-600"} 
          detail="Sales - Purchases - Expenses"
        />
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between no-print">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
            <PieChart size={24} />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900">Profitability Ratio</h4>
            <p className="text-sm text-indigo-600">The current profit margin for this period is <span className="font-black">{((financialData.profit / (financialData.totalSales || 1)) * 100).toFixed(1)}%</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-indigo-400 uppercase">Period Performance</p>
          <p className={`text-xl font-black ${financialData.profit >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
            {financialData.profit >= 0 ? 'POSITIVE' : 'NEGATIVE'}
          </p>
        </div>
      </div>

      {/* Print View Modal */}
      {isPrintViewOpen && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative">
            <div className="p-6 border-b flex justify-between items-center no-print">
              <h3 className="text-xl font-bold text-gray-900">Print Preview: Financial Report</h3>
              <div className="flex space-x-3">
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2">
                  <Printer size={18} />
                  <span>Print Document</span>
                </button>
                <button onClick={() => setIsPrintViewOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg"><X /></button>
              </div>
            </div>

            <div className="p-12 bg-white print-only">
              <div className="flex justify-between items-end mb-10 border-b-8 border-black pb-8">
                <div>
                  <h1 className="text-5xl font-black text-black">Royal Threads</h1>
                  <p className="text-xl font-bold text-gray-600 uppercase tracking-widest mt-2">Financial Performance Report</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Reported: {new Date().toLocaleDateString('en-PK')}</p>
                  <p className="text-sm text-gray-400">Worker Filter: {selectedWorker}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-12">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase">Reporting Basis</p>
                    <p className="text-lg font-black text-indigo-700 capitalize">{filterType}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase">Date Range</p>
                    <p className="text-lg font-black text-gray-900">
                      {filterType === 'daily' ? startDate : 
                       filterType === 'weekly' || filterType === 'custom' ? `${startDate} to ${endDate}` :
                       filterType === 'monthly' ? `${selectedMonth + 1}/${selectedYear}` : selectedYear}
                    </p>
                  </div>
                </div>
                <div className="bg-black text-white p-8 rounded-3xl flex flex-col justify-center text-center">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-60">Calculated Net Profit</p>
                  <p className="text-5xl font-black mt-2">PKR {financialData.profit.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-black border-b-4 border-black pb-2 uppercase italic">Executive Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b-2 border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-black">S</div>
                      <span className="text-xl font-bold">Total Sales (Delivered)</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600">PKR {financialData.totalSales.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b-2 border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-black">P</div>
                      <span className="text-xl font-bold">Total Inventory Purchases</span>
                    </div>
                    <span className="text-2xl font-black text-indigo-600">PKR {financialData.totalPurchases.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b-2 border-black">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center font-black">E</div>
                      <span className="text-xl font-bold">Total Operating Expenses</span>
                    </div>
                    <span className="text-2xl font-black text-rose-600">PKR {financialData.totalExpenses.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-8 bg-gray-900 text-white px-8 rounded-3xl">
                    <span className="text-3xl font-black uppercase">Final Net Profit</span>
                    <span className="text-4xl font-black">PKR {financialData.profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-3 gap-8">
                <div className="text-center p-4 border-2 border-dotted border-gray-300 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-gray-400">Order Throughput</p>
                  <p className="text-2xl font-black">{financialData.orderCount}</p>
                </div>
                <div className="text-center p-4 border-2 border-dotted border-gray-300 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-gray-400">Profit Margin</p>
                  <p className="text-2xl font-black">{((financialData.profit / (financialData.totalSales || 1)) * 100).toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 border-2 border-dotted border-gray-300 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-gray-400">Units Processed</p>
                  <p className="text-2xl font-black">{financialData.purchaseCount + financialData.expenseCount}</p>
                </div>
              </div>

              <div className="mt-20 pt-10 border-t-2 border-gray-200 flex justify-between items-center">
                <div className="text-[10px] font-bold text-gray-400 space-y-1">
                  <p>SYSTEM GENERATED AUDIT REPORT</p>
                  <p>VERIFIED FOR INTERNAL BUSINESS USE ONLY</p>
                  <p>TIMESTAMP: {new Date().toISOString()}</p>
                </div>
                <div className="text-center">
                  <div className="w-48 h-px bg-black mb-2"></div>
                  <p className="text-xs font-bold uppercase italic">CEO / Accountant Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
