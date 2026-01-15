
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Truck, 
  Wallet, 
  Calendar, 
  Filter, 
  Printer, 
  Search,
  ChevronRight,
  BarChart3,
  X
} from 'lucide-react';
import { OrderStatus, Order } from '../types';

type FilterType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const Reports = () => {
  const { state, computed } = useStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'detailed'>('analytics');
  
  // Detailed Report States
  const [filterType, setFilterType] = useState<FilterType>('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    return state.orders.filter(order => {
      const orderDate = new Date(order.date);
      
      if (filterType === 'daily') {
        return order.date === startDate;
      }
      
      if (filterType === 'weekly' || filterType === 'custom') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return orderDate >= start && orderDate <= end;
      }
      
      if (filterType === 'monthly') {
        return orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
      }
      
      if (filterType === 'yearly') {
        return orderDate.getFullYear() === selectedYear;
      }
      
      return true;
    }).reverse();
  }, [state.orders, filterType, startDate, endDate, selectedMonth, selectedYear]);

  const reportSummary = useMemo(() => {
    const total = filteredOrders.reduce((acc, o) => acc + (o.salePrice * o.quantity), 0);
    const delivered = filteredOrders.filter(o => o.status === OrderStatus.DELIVERED).length;
    const returned = filteredOrders.filter(o => o.status === OrderStatus.RETURNED).length;
    const pending = filteredOrders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.SHIPPED).length;
    
    return { total, delivered, returned, pending, count: filteredOrders.length };
  }, [filteredOrders]);

  const handleExport = () => {
    alert("Data export initiated. In a real application, this would download an Excel/CSV file.");
  };

  const ReportSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center space-x-3 mb-6 border-b pb-4">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  // Added key?: React.Key to StatItem props to fix TS error when mapping
  const StatItem = ({ label, value, trend }: { label: string, value: string, trend?: 'up' | 'down', key?: React.Key }) => (
    <div className="flex justify-between items-end">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend === 'up' ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
          {trend === 'up' ? 'Profit' : 'Loss'}
        </span>
      )}
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
          <h2 className="text-3xl font-bold text-gray-900">Business Reports</h2>
          <p className="text-gray-500">Analyze performance and generate detailed order logs.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center space-x-2 ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <BarChart3 size={16} />
            <span>Analytics Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('detailed')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center space-x-2 ${activeTab === 'detailed' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FileText size={16} />
            <span>Detailed Order Reports</span>
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <div className="no-print space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ReportSection title="Profit & Loss" icon={TrendingUp}>
              <StatItem label="Gross Sales" value={`PKR ${computed.totalSales.toLocaleString()}`} />
              <StatItem label="Cost of Goods Sold" value={`PKR ${computed.cogs.toLocaleString()}`} />
              <StatItem label="Total Expenses" value={`PKR ${computed.totalExpenses.toLocaleString()}`} />
              <div className="pt-4 border-t mt-4">
                <StatItem 
                  label="Net Profit" 
                  value={`PKR ${computed.netProfit.toLocaleString()}`} 
                  trend={computed.netProfit >= 0 ? 'up' : 'down'}
                />
              </div>
            </ReportSection>

            <ReportSection title="Sales Performance" icon={ShoppingBag}>
              <StatItem label="Total Orders Placed" value={state.orders.length.toString()} />
              <StatItem label="Delivered Orders" value={state.orders.filter(o => o.status === OrderStatus.DELIVERED).length.toString()} />
              <StatItem label="Returns Rate" value={`${((state.orders.filter(o => o.status === OrderStatus.RETURNED).length / (state.orders.length || 1)) * 100).toFixed(1)}%`} />
              <div className="pt-4 border-t mt-4">
                <StatItem label="Avg Order Value" value={`PKR ${(computed.totalSales / (state.orders.filter(o => o.status === OrderStatus.DELIVERED).length || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})}`} />
              </div>
            </ReportSection>

            <ReportSection title="Courier Analytics" icon={Truck}>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">TCS Performance</p>
                  <StatItem label="Receivable" value={`PKR ${computed.getCourierReceivable('TCS').toLocaleString()}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">PostEx Performance</p>
                  <StatItem label="Receivable" value={`PKR ${computed.getCourierReceivable('PostEx').toLocaleString()}`} />
                </div>
              </div>
            </ReportSection>

            <ReportSection title="Expense Summary" icon={Wallet}>
              <div className="max-h-[200px] overflow-y-auto pr-2">
                {Object.entries(
                  state.expenses.reduce((acc, e) => {
                    acc[e.category] = (acc[e.category] || 0) + e.amount;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([cat, amount]) => (
                  <StatItem key={cat} label={cat} value={`PKR ${amount.toLocaleString()}`} />
                ))}
                {state.expenses.length === 0 && <p className="text-sm text-gray-400 italic">No expenses recorded.</p>}
              </div>
            </ReportSection>

            <ReportSection title="Supplier Overview" icon={FileText}>
              <div className="max-h-[200px] overflow-y-auto pr-2">
                {state.suppliers.map(s => {
                  const amount = state.purchases.filter(p => p.supplierId === s.id).reduce((acc, p) => acc + p.total, 0);
                  return (
                    <StatItem key={s.id} label={s.name} value={`PKR ${amount.toLocaleString()}`} />
                  );
                })}
                {state.suppliers.length === 0 && <p className="text-sm text-gray-400 italic">No suppliers recorded.</p>}
              </div>
            </ReportSection>

            <ReportSection title="Inventory Health" icon={ShoppingBag}>
              <StatItem label="Unique Products" value={state.products.length.toString()} />
              <StatItem label="Total Units in Stock" value={state.products.reduce((acc, p) => acc + p.stockCount, 0).toString()} />
              <StatItem label="Low Stock Items" value={computed.lowStockProducts.length.toString()} />
              <div className="pt-4 border-t mt-4">
                <StatItem label="Current Inventory Value" value={`PKR ${computed.currentStockValue.toLocaleString()}`} />
              </div>
            </ReportSection>
          </div>

          <div className="bg-indigo-900 text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Weekly Summary Report</h3>
              <p className="text-indigo-200">System auto-generated report for the current week.</p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-4">
              <div className="text-center px-6 border-r border-indigo-700">
                <p className="text-xs uppercase text-indigo-300 font-bold">Week's Profit</p>
                <p className="text-2xl font-bold">PKR {Math.max(0, computed.netProfit / 4).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
              </div>
              <div className="text-center px-6">
                <p className="text-xs uppercase text-indigo-300 font-bold">Active Parcels</p>
                <p className="text-2xl font-bold">{state.orders.filter(o => o.status === OrderStatus.SHIPPED).length}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Order Reports */
        <div className="space-y-6 no-print">
          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Filter Type</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as FilterType[]).map((type) => (
                  <button 
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition ${filterType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            {filterType === 'monthly' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Month</label>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

            <button 
              onClick={() => setIsPrintViewOpen(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 ml-auto h-[38px]"
            >
              <Printer size={18} />
              <span>Generate & Print</span>
            </button>
          </div>

          {/* Detailed Report Table Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Report Preview ({filteredOrders.length} Orders)</h3>
              <div className="text-sm font-bold text-indigo-600">
                Total Value: PKR {reportSummary.total.toLocaleString()}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-500 uppercase font-bold tracking-tighter">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Tracking</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Worker</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => {
                    const product = state.products.find(p => p.id === order.productId);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-bold">{order.orderNumber}</td>
                        <td className="px-4 py-3 font-mono">{order.trackingId}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-[10px] text-gray-400">{order.phone}</p>
                        </td>
                        <td className="px-4 py-3 font-bold uppercase">{order.city}</td>
                        <td className="px-4 py-3">{product?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-indigo-600 font-medium">{order.workerName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' :
                            order.status === OrderStatus.RETURNED ? 'bg-rose-100 text-rose-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold">{(order.salePrice * order.quantity).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">No orders found for the selected filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Print Modal */}
      {isPrintViewOpen && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-7xl shadow-2xl relative">
            {/* Modal Controls (No Print) */}
            <div className="p-6 border-b flex justify-between items-center no-print">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Final Detailed Report</h3>
                <p className="text-sm text-gray-500">Preview of the print-ready document.</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => window.print()} 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition shadow-xl shadow-indigo-200"
                >
                  <Printer size={20} />
                  <span>Print Report Now</span>
                </button>
                <button 
                  onClick={() => setIsPrintViewOpen(false)} 
                  className="p-3 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-xl transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div className="p-10 bg-white print-only">
              {/* Report Header */}
              <div className="flex justify-between items-end mb-8 border-b-4 border-black pb-6">
                <div>
                  <h1 className="text-4xl font-black text-black">Royal Threads</h1>
                  <p className="text-lg font-bold text-gray-600 uppercase tracking-widest">Business Detailed Order Report</p>
                  <div className="mt-4 flex space-x-6">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Filter Basis</p>
                      <p className="text-sm font-bold text-indigo-700 capitalize">{filterType}</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Reporting Period</p>
                      <p className="text-sm font-bold text-gray-800">
                        {filterType === 'daily' ? startDate : 
                         filterType === 'weekly' || filterType === 'custom' ? `${startDate} to ${endDate}` :
                         filterType === 'monthly' ? `${selectedMonth + 1}/${selectedYear}` : selectedYear}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="bg-black text-white px-6 py-3 rounded-2xl">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Order Value</p>
                    <p className="text-3xl font-black">PKR {reportSummary.total.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800">Total Count: <span className="text-indigo-600">{reportSummary.count}</span> Orders</p>
                  <div className="flex justify-end space-x-3 text-[10px] font-bold uppercase">
                    <span className="text-green-600">Delivered: {reportSummary.delivered}</span>
                    <span className="text-rose-600">Returned: {reportSummary.returned}</span>
                    <span className="text-blue-600">Pending: {reportSummary.pending}</span>
                  </div>
                </div>
              </div>

              {/* Main Report Table */}
              <table className="w-full text-left border-collapse border-2 border-black text-[10px]">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-black">
                    <th className="border-r border-black p-2 font-bold w-14 text-center">Order #</th>
                    <th className="border-r border-black p-2 font-bold">Tracking ID</th>
                    <th className="border-r border-black p-2 font-bold">Customer & Phone</th>
                    <th className="border-r border-black p-2 font-bold">City</th>
                    <th className="border-r border-black p-2 font-bold">Product Name</th>
                    <th className="border-r border-black p-2 font-bold">Price</th>
                    <th className="border-r border-black p-2 font-bold">Worker</th>
                    <th className="border-r border-black p-2 font-bold">Status</th>
                    <th className="border-r border-black p-2 font-bold">Cost/Tax</th>
                    <th className="border-r border-black p-2 font-bold w-12">WhatsApp</th>
                    <th className="border-r border-black p-2 font-bold w-10">Call</th>
                    <th className="p-2 font-bold w-10">SMS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const product = state.products.find(p => p.id === order.productId);
                    return (
                      <tr key={order.id} className="border-b border-black">
                        <td className="border-r border-black p-2 text-center font-bold bg-gray-50">{order.orderNumber}</td>
                        <td className="border-r border-black p-2 font-mono whitespace-nowrap">{order.trackingId}</td>
                        <td className="border-r border-black p-2">
                          <p className="font-bold">{order.customerName}</p>
                          <p>{order.phone}</p>
                        </td>
                        <td className="border-r border-black p-2 font-bold uppercase">{order.city}</td>
                        <td className="border-r border-black p-2 truncate max-w-[120px]">{product?.name || 'N/A'}</td>
                        <td className="border-r border-black p-2 font-black text-right">PKR {(order.salePrice * order.quantity).toLocaleString()}</td>
                        <td className="border-r border-black p-2 font-bold text-indigo-700">{order.workerName}</td>
                        <td className="border-r border-black p-2 text-center">
                          <span className={`font-black uppercase text-[8px] ${
                            order.status === OrderStatus.DELIVERED ? 'text-green-600' :
                            order.status === OrderStatus.RETURNED ? 'text-rose-600' :
                            'text-gray-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="border-r border-black p-2 text-[8px]">
                          {order.deliveryCost > 0 && <div>Ship: {order.deliveryCost}</div>}
                          {order.salesTax > 0 && <div>Tax: {order.salesTax}</div>}
                          {order.deliveryCost === 0 && order.salesTax === 0 && <span className="text-gray-300 italic">--</span>}
                        </td>
                        <td className="border-r border-black p-2"></td>
                        <td className="border-r border-black p-2"></td>
                        <td className="p-2"></td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={12} className="p-20 text-center text-gray-400 italic text-lg uppercase font-bold tracking-widest">
                        NO RECORD FOUND FOR THIS PERIOD
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Report Footer */}
              <div className="mt-8 pt-6 border-t border-dotted border-gray-400 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase italic">
                <span>Royal Threads Business Manager - Confidential Internal Report</span>
                <span>System Timestamp: {new Date().toLocaleString()}</span>
                <span>Authorized Signature: _______________________</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
