
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Calendar, User, Box } from 'lucide-react';

const Purchases = () => {
  const { state, actions } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    productId: '',
    quantity: 0,
    rate: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.productId) return alert('Select supplier and product');
    actions.addPurchase(formData);
    setIsModalOpen(false);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      supplierId: '', 
      productId: '', 
      quantity: 0, 
      rate: 0 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Purchases</h2>
          <p className="text-gray-500">Record inventory restocking events.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>New Purchase</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Rate</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.purchases.slice().reverse().map(purchase => {
                const supplier = state.suppliers.find(s => s.id === purchase.supplierId);
                const product = state.products.find(p => p.id === purchase.productId);
                return (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600 text-sm">{purchase.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{supplier?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{product?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">{purchase.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-600">PKR {purchase.rate.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">PKR {purchase.total.toLocaleString()}</td>
                  </tr>
                );
              })}
              {state.purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No purchase records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Record Purchase</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar size={14} className="mr-1" /> Date
                </label>
                <input 
                  required
                  type="date" 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <User size={14} className="mr-1" /> Supplier
                </label>
                <select 
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.supplierId}
                  onChange={e => setFormData({...formData, supplierId: e.target.value})}
                >
                  <option value="">Select Supplier</option>
                  {state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Box size={14} className="mr-1" /> Product
                </label>
                <select 
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.productId}
                  onChange={e => {
                    const prod = state.products.find(p => p.id === e.target.value);
                    setFormData({...formData, productId: e.target.value, rate: prod?.costPrice || 0});
                  }}
                >
                  <option value="">Select Product</option>
                  {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.quantity || ''}
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate (PKR)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.rate || ''}
                    onChange={e => setFormData({...formData, rate: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Purchase Amount</span>
                <span className="text-xl font-bold text-indigo-700">PKR {(formData.quantity * formData.rate).toLocaleString()}</span>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Confirm Purchase
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
