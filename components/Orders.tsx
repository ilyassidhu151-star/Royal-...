
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Plus, Truck, Search, ChevronDown, DollarSign, Edit2, Hash, Scan, Printer, FileText, X, AlertCircle, User } from 'lucide-react';
import { OrderStatus, Courier, Order } from '../types';
import ScannerOverlay from './ScannerOverlay';

const Label = ({ order, product }: { order: Order, product?: any, key?: React.Key }) => (
  <div className="label-container p-4 border-2 border-black w-[80mm] h-[50mm] flex flex-col justify-between text-black bg-white mb-2">
    <div className="flex justify-between items-start border-b border-black pb-1">
      <div className="font-bold text-sm">Order: {order.orderNumber}</div>
      <div className="text-[10px] font-mono">{order.date}</div>
    </div>
    <div className="mt-2 space-y-1">
      <div className="flex justify-between">
        <span className="font-bold text-xs">Tracking:</span>
        <span className="text-xs font-mono">{order.trackingId}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold text-xs">Customer:</span>
        <span className="text-xs">{order.customerName}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold text-xs">Worker:</span>
        <span className="text-xs font-bold">{order.workerName}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-bold text-xs">City:</span>
        <span className="text-xs uppercase font-bold">{order.city}</span>
      </div>
      <div className="flex justify-between border-t border-dotted border-black pt-1">
        <span className="font-bold text-[10px]">Product:</span>
        <span className="text-[10px] truncate max-w-[50mm]">{product?.name || 'Item'} (x{order.quantity})</span>
      </div>
    </div>
    <div className="flex justify-between items-center border-t border-black pt-1">
      <span className="text-[10px] font-bold italic">{order.courier}</span>
      <span className="text-lg font-black">PKR {(order.salePrice * order.quantity).toLocaleString()}</span>
    </div>
  </div>
);

const Orders = () => {
  const { state, actions } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCostingModalOpen, setIsCostingModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoadSheetOpen, setIsLoadSheetOpen] = useState(false);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  
  const [search, setSearch] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [costingData, setCostingData] = useState({ deliveryCost: 0, salesTax: 0 });
  const [newTrackingId, setNewTrackingId] = useState('');
  
  const isAdmin = state.currentUser?.role === 'admin';

  const initialForm = useMemo(() => {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      customerName: '',
      phone: '',
      address: '',
      city: '',
      productId: '',
      quantity: 1,
      salePrice: 0,
      courier: Courier.TCS,
      status: OrderStatus.PENDING,
      trackingId: '',
      workerName: '',
      workerId: ''
    };
  }, [isModalOpen]);

  const [formData, setFormData] = useState(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!formData.productId) return alert('Select a product');
    if (!formData.trackingId) return alert('Tracking ID is mandatory');
    if (!formData.workerId) return alert('Please select a Worker');
    
    const worker = state.workers.find(w => w.id === formData.workerId);
    actions.addOrder({ ...formData, workerName: worker?.name || 'Unknown' });
    setIsModalOpen(false);
    setFormData(initialForm);
  };

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    if (!isAdmin) return;
    if (newStatus === OrderStatus.DELIVERED || newStatus === OrderStatus.RETURNED) {
      setActiveOrderId(id);
      setPendingStatus(newStatus);
      setIsCostingModalOpen(true);
    } else {
      actions.updateOrderStatus(id, newStatus);
    }
  };

  const submitCosting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (activeOrderId && pendingStatus) {
      actions.updateOrderStatus(activeOrderId, pendingStatus, costingData);
      setIsCostingModalOpen(false);
      setActiveOrderId(null);
      setPendingStatus(null);
      setCostingData({ deliveryCost: 0, salesTax: 0 });
    }
  };

  const handleEditTracking = (id: string, currentTracking: string) => {
    if (!isAdmin) return;
    setActiveOrderId(id);
    setNewTrackingId(currentTracking);
    setIsTrackingModalOpen(true);
  };

  const submitTrackingUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (activeOrderId && newTrackingId) {
      actions.updateOrderTracking(activeOrderId, newTrackingId);
      setIsTrackingModalOpen(false);
      setActiveOrderId(null);
    }
  };

  const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
    [OrderStatus.SHIPPED]: 'bg-blue-100 text-blue-700',
    [OrderStatus.DELIVERED]: 'bg-green-100 text-green-700',
    [OrderStatus.RETURNED]: 'bg-rose-100 text-rose-700',
  };

  const filteredOrders = state.orders.filter(o => 
    o.customerName.toLowerCase().includes(search.toLowerCase()) || 
    o.phone.includes(search) ||
    o.trackingId.toLowerCase().includes(search.toLowerCase()) ||
    o.city?.toLowerCase().includes(search.toLowerCase()) ||
    o.workerName?.toLowerCase().includes(search.toLowerCase())
  ).reverse();

  const todayOrders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.orders.filter(o => o.date === today);
  }, [state.orders]);

  const printSingleLabel = (order: Order) => {
    const product = state.products.find(p => p.id === order.productId);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Print Label</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="label-root"></div></body></html>`);
      const LabelRoot = win.document.getElementById('label-root');
      if (LabelRoot) {
        import('react').then(React => {
          import('react-dom/client').then(ReactDOM => {
            ReactDOM.createRoot(LabelRoot).render(<Label order={order} product={product} />);
            setTimeout(() => { win.print(); win.close(); }, 500);
          });
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } }`}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Orders Dispatch</h2>
          <p className="text-gray-500">{isAdmin ? 'Managing enterprise dispatch' : 'Viewing real-time dispatch log'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <button onClick={() => setIsLoadSheetOpen(true)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg flex items-center space-x-2 border border-indigo-200 font-bold"><FileText size={18} /><span>Load Sheet</span></button>
              <button onClick={() => setIsBatchPrintOpen(true)} className="bg-sky-50 text-sky-700 px-4 py-2 rounded-lg flex items-center space-x-2 border border-sky-200 font-bold"><Printer size={18} /><span>Batch Print</span></button>
              <button onClick={() => setIsScannerOpen(true)} className="bg-white border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg flex items-center space-x-2 font-bold"><Scan size={18} /><span>Scan</span></button>
              <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-indigo-200 font-bold"><Plus size={18} /><span>New Order</span></button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-semibold">
              <tr><th className="px-6 py-4">Ref #</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Processed By</th><th className="px-6 py-4">Tracking</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Label</th><th className="px-6 py-4 text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => {
                const product = state.products.find(p => p.id === order.productId);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.date}</p>
                    </td>
                    <td className="px-6 py-4"><span className="font-medium text-gray-900">{order.customerName}</span><p className="text-xs text-gray-500">{order.city} | {order.phone}</p></td>
                    <td className="px-6 py-4"><span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{order.workerName}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 group">
                          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{order.trackingId || 'N/A'}</span>
                          {isAdmin && <button onClick={() => handleEditTracking(order.id, order.trackingId)} className="opacity-0 group-hover:opacity-100 text-indigo-600"><Edit2 size={12} /></button>}
                        </div>
                        <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold ${order.courier === Courier.TCS ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>{order.courier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block text-left">
                        <select disabled={!isAdmin} className={`appearance-none rounded-full px-3 py-1 pr-8 text-xs font-bold border-none outline-none ${isAdmin ? 'cursor-pointer' : 'cursor-default'} ${statusColors[order.status]}`} value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}>
                          {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {isAdmin && <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => printSingleLabel(order)} className="text-gray-400 hover:text-indigo-600 transition"><Printer size={18} /></button>
                    </td>
                    <td className="px-6 py-4 text-right"><p className="font-bold text-gray-900">PKR {(order.salePrice * order.quantity).toLocaleString()}</p></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Specific Modals */}
      {isAdmin && isBatchPrintOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative">
            <div className="p-6 border-b flex justify-between items-center no-print">
              <h3 className="text-xl font-bold text-gray-900">Batch Print Labels</h3>
              <div className="flex space-x-2">
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2"><Printer size={18} /><span>Print Sheet</span></button>
                <button onClick={() => setIsBatchPrintOpen(false)} className="p-2 text-gray-400 hover:text-gray-600"><X /></button>
              </div>
            </div>
            <div className="p-8 grid grid-cols-2 gap-4 bg-gray-50">{state.orders.slice(-12).map(order => (<Label key={order.id} order={order} product={state.products.find(p => p.id === order.productId)} />))}</div>
          </div>
        </div>
      )}

      {isAdmin && isLoadSheetOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl relative">
            <div className="p-6 border-b flex justify-between items-center no-print">
              <h3 className="text-xl font-bold text-gray-900">Daily Load Sheet</h3>
              <div className="flex space-x-2">
                <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2"><Printer size={18} /><span>Print Sheet</span></button>
                <button onClick={() => setIsLoadSheetOpen(false)} className="p-2 text-gray-400 hover:text-gray-600"><X /></button>
              </div>
            </div>
            <div className="p-8 bg-white">
              <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4"><div><h1 className="text-3xl font-black text-black">Royal Threads</h1><p className="text-sm font-bold text-gray-600">Daily Load Sheet</p></div><div className="text-right"><p className="text-lg font-bold">Date: {new Date().toLocaleDateString('en-PK')}</p></div></div>
              <table className="w-full text-left border-collapse border border-black text-[9px]">
                <thead><tr className="bg-gray-100"><th>Order #</th><th>Worker</th><th>Tracking ID</th><th>Phone</th><th>Name</th><th>City</th><th>Product</th><th>Price</th></tr></thead>
                <tbody>{todayOrders.map(order => { const product = state.products.find(p => p.id === order.productId); return (<tr key={order.id} className="border-b border-black"><td>{order.orderNumber}</td><td className="font-bold">{order.workerName}</td><td>{order.trackingId}</td><td>{order.phone}</td><td>{order.customerName}</td><td className="uppercase">{order.city}</td><td>{product?.name || 'N/A'}</td><td className="font-bold">{(order.salePrice * order.quantity).toLocaleString()}</td></tr>); })}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Create New Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Customer Info</h4>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Worker/Staff (Required)</label><select required className="w-full border border-indigo-200 bg-indigo-50 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={formData.workerId} onChange={e => setFormData({...formData, workerId: e.target.value})}><option value="">Select Worker</option>{state.workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label><input required type="text" className="w-full border rounded-lg p-2" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input required type="text" className="w-full border rounded-lg p-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input required type="text" className="w-full border rounded-lg p-2 font-bold uppercase" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea required rows={2} className="w-full border rounded-lg p-2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Order & Logistics</h4>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label><input required type="text" className="w-full border border-indigo-200 bg-indigo-50 rounded-lg p-2" value={formData.trackingId} onChange={e => setFormData({...formData, trackingId: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Product</label><select required className="w-full border rounded-lg p-2 bg-white" value={formData.productId} onChange={e => { const prod = state.products.find(p => p.id === e.target.value); setFormData({...formData, productId: e.target.value, salePrice: prod?.salePrice || 0}); }}><option value="">Select Product</option>{state.products.map(p => <option key={p.id} value={p.id} disabled={p.stockCount <= 0}>{p.name} ({p.stockCount} left)</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Qty</label><input required type="number" min="1" className="w-full border rounded-lg p-2" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Price</label><input required type="number" className="w-full border rounded-lg p-2" value={formData.salePrice || ''} onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Courier</label><div className="flex space-x-2"><button type="button" onClick={() => setFormData({...formData, courier: Courier.TCS})} className={`flex-1 py-2 rounded-lg border font-bold ${formData.courier === Courier.TCS ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>TCS</button><button type="button" onClick={() => setFormData({...formData, courier: Courier.POSTEX})} className={`flex-1 py-2 rounded-lg border font-bold ${formData.courier === Courier.POSTEX ? 'bg-orange-600 text-white' : 'text-gray-600'}`}>PostEx</button></div></div>
                </div>
              </div>
              <div className="bg-indigo-700 text-white p-6 rounded-xl flex justify-between items-center"><div><p className="text-indigo-200 text-sm">Total Bill</p><p className="text-3xl font-bold">PKR {(formData.quantity * formData.salePrice).toLocaleString()}</p></div><button type="submit" className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-lg hover:bg-indigo-50">Place Order</button></div>
            </form>
          </div>
        </div>
      )}

      {isAdmin && isScannerOpen && <ScannerOverlay isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />}
    </div>
  );
};

export default Orders;
