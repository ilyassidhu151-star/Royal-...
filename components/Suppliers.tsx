
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Users, Phone, MapPin } from 'lucide-react';

const Suppliers = () => {
  const { state, actions } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.addSupplier(formData);
    setIsModalOpen(false);
    setFormData({ name: '', contact: '', address: '' });
  };

  const getSupplierStats = (supplierId: string) => {
    const purchases = state.purchases.filter(p => p.supplierId === supplierId);
    const totalAmount = purchases.reduce((acc, p) => acc + p.total, 0);
    const totalStock = purchases.reduce((acc, p) => acc + p.quantity, 0);
    return { totalAmount, totalStock };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Suppliers</h2>
          <p className="text-gray-500">Track vendor relationships and stock sourcing.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.suppliers.map(supplier => {
          const stats = getSupplierStats(supplier.id);
          return (
            <div key={supplier.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                  <Users size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Total Purchases</p>
                  <p className="font-bold text-indigo-600">PKR {stats.totalAmount.toLocaleString()}</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{supplier.name}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center space-x-2">
                  <Phone size={14} className="text-gray-400" />
                  <span>{supplier.contact}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{supplier.address}</span>
                </p>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-sm font-medium text-gray-400">Total Units Supplied</span>
                <span className="font-bold text-gray-900">{stats.totalStock} units</span>
              </div>
            </div>
          );
        })}
        {state.suppliers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
            No suppliers added yet.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Add New Supplier</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  required
                  type="text" 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Save Supplier
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
