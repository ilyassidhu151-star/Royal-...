
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  UserCheck, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Wallet, 
  X,
  Calendar,
  Hash,
  ChevronRight
} from 'lucide-react';
import { OrderStatus, Order } from '../types';

type FilterType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const WorkerReports = () => {
  const { state } = useStore();
  
  // Filter States
  const [filterType, setFilterType] = useState<FilterType>('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);

  const selectedWorker = useMemo(() => {
    return state.workers.find(w => w.id === selectedWorkerId);
  }, [state.workers, selectedWorkerId]);

  const filteredOrders = useMemo(() => {
    if (!selectedWorkerId) return [];

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

    // Note: We match by name for legacy or ID for new orders
    const worker = state.workers.find(w => w.id === selectedWorkerId);
    
    return state.orders.filter(o => {
      const dateMatch = isWithinRange(o.date);
      const workerMatch = o.workerId === selectedWorkerId || o.workerName === worker?.name;
      return dateMatch && workerMatch;
    }).reverse();
  }, [state.orders, state.workers, selectedWorkerId, filterType, startDate, endDate, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    if (!selectedWorker) return { total: 0, delivered: 0, returned: 0, payment: 0 };
    
    const total = filteredOrders.length;
    const delivered = filteredOrders.filter(o => o.status === OrderStatus.DELIVERED).length;
    const returned = filteredOrders.filter(o => o.status === OrderStatus.RETURNED).length;
    const payment = total * selectedWorker.perOrderRate;

    return { total, delivered, returned, payment };
  }, [filteredOrders, selectedWorker]);

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
          <h2 className="text-3xl font-bold text-gray-900">Worker Reports & Payments</h2>
          <p className="text-gray-500">Track performance and calculate staff commissions.</p>
        </div>
        {selectedWorkerId && (
          <button 
            onClick={() => setIsPrintViewOpen(true)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition shadow-xl shadow-indigo-200"
          >
            <Printer size={20} />
            <span>Print Worker Report</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-6 no-print">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Select Worker</label>
          <select 
            value={selectedWorkerId} 
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="border rounded-xl px-4 py-2 text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-white h-[40px] min-w-[200px]"
          >
            <option value="">-- Choose Worker --</option>
            {state.workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

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
      </div>

      {!selectedWorkerId ? (
        <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400 no-print">
          <UserCheck size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl font-medium">Select a worker from the dropdown to see their performance.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
              <h3 className="text-3xl font-black text-gray-900">{stats.total}</h3>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
                <Package size={14} className="mr-1" /> All parcels handled
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Delivered</p>
              <h3 className="text-3xl font-black text-emerald-600">{stats.delivered}</h3>
              <div className="mt-4 flex items-center text-xs font-bold text-emerald-600">
                <TrendingUp size={14} className="mr-1" /> Successful drop-offs
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Returned</p>
              <h3 className="text-3xl font-black text-rose-600">{stats.returned}</h3>
              <div className="mt-4 flex items-center text-xs font-bold text-rose-600">
                <TrendingDown size={14} className="mr-1" /> RTO parcels
              </div>
            </div>
            <div className="bg-indigo-700 p-6 rounded-2xl shadow-xl shadow-indigo-200 text-white">
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Total Earnings</p>
              <h3 className="text-3xl font-black">PKR {stats.payment.toLocaleString()}</h3>
              <div className="mt-4 flex items-center text-xs font-bold text-indigo-100">
                <Wallet size={14} className="mr-1" /> Calculated commission
              </div>
            </div>
          </div>

          {/* Detailed Table Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden no-print">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Detailed Activity Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-500 uppercase font-bold tracking-tighter">
                  <tr>
                    <th className="px-6 py-4">Ref #</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Tracking ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.phone}</p>
                      </td>
                      <td className="px-6 py-4 font-mono">{order.trackingId}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' :
                          order.status === OrderStatus.RETURNED ? 'bg-rose-100 text-rose-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">{(order.salePrice * order.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No orders found for this worker in the selected period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Print View Modal */}
      {isPrintViewOpen && selectedWorker && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative">
            <div className="p-6 border-b flex justify-between items-center no-print">
              <h3 className="text-xl font-bold text-gray-900">Print Preview: Worker Report</h3>
              <div className="flex space-x-3">
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2">
                  <Printer size={18} />
                  <span>Print Now</span>
                </button>
                <button onClick={() => setIsPrintViewOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg"><X /></button>
              </div>
            </div>

            <div className="p-12 bg-white print-only">
              <div className="flex justify-between items-end mb-10 border-b-8 border-black pb-8">
                <div>
                  <h1 className="text-5xl font-black text-black">Royal Threads</h1>
                  <p className="text-xl font-bold text-gray-600 uppercase tracking-widest mt-2">Worker Performance & Payment Report</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Worker: {selectedWorker.name}</p>
                  <p className="text-sm text-gray-400">Date Generated: {new Date().toLocaleDateString('en-PK')}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-12">
                <div className="bg-gray-100 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase text-gray-400">Total Handled</p>
                  <p className="text-3xl font-black">{stats.total}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase text-gray-400">Delivered</p>
                  <p className="text-3xl font-black text-green-600">{stats.delivered}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase text-gray-400">Returned</p>
                  <p className="text-3xl font-black text-rose-600">{stats.returned}</p>
                </div>
                <div className="bg-black text-white p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase opacity-60">Payment Earned</p>
                  <p className="text-3xl font-black">PKR {stats.payment.toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-4 text-xs font-bold text-gray-500 uppercase">
                Reporting Period: {filterType === 'daily' ? startDate : 
                                  filterType === 'weekly' || filterType === 'custom' ? `${startDate} to ${endDate}` :
                                  filterType === 'monthly' ? `${selectedMonth + 1}/${selectedYear}` : selectedYear}
              </div>

              <table className="w-full text-left border-collapse border-2 border-black text-[10px]">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-black">
                    <th className="border-r border-black p-2 font-bold w-14">Order #</th>
                    <th className="border-r border-black p-2 font-bold">Tracking ID</th>
                    <th className="border-r border-black p-2 font-bold">Customer Name</th>
                    <th className="border-r border-black p-2 font-bold">Phone</th>
                    <th className="border-r border-black p-2 font-bold text-center">Status</th>
                    <th className="p-2 font-bold text-right">Comm.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-black">
                      <td className="border-r border-black p-2 font-bold">{order.orderNumber}</td>
                      <td className="border-r border-black p-2 font-mono">{order.trackingId}</td>
                      <td className="border-r border-black p-2 font-bold">{order.customerName}</td>
                      <td className="border-r border-black p-2">{order.phone}</td>
                      <td className="border-r border-black p-2 text-center uppercase font-black text-[8px]">
                        {order.status}
                      </td>
                      <td className="p-2 text-right font-bold">PKR {selectedWorker.perOrderRate}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-gray-300 italic">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-20 pt-10 border-t-2 border-gray-200 flex justify-between items-center">
                <div className="text-[10px] font-bold text-gray-400 space-y-1">
                  <p>CALCULATED RATE: PKR {selectedWorker.perOrderRate} / order</p>
                  <p>PAYMENT STATUS: DUE</p>
                </div>
                <div className="text-center">
                  <div className="w-48 h-px bg-black mb-2"></div>
                  <p className="text-xs font-bold uppercase italic">Worker Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-48 h-px bg-black mb-2"></div>
                  <p className="text-xs font-bold uppercase italic">Manager Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerReports;
