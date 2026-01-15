
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Search, AlertCircle, Package } from 'lucide-react';

const Inventory = () => {
  const { state, actions } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    costPrice: 0,
    salePrice: 0,
    lowStockThreshold: 5
  });

  const isAdmin = state.currentUser?.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    actions.addProduct(formData);
    setIsModalOpen(false);
    setFormData({ name: '', sku: '', category: '', costPrice: 0, salePrice: 0, lowStockThreshold: 5 });
  };

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-500">Manage your products and track stock levels.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">Sale Price</th>
                <th className="px-6 py-4 text-center">In Stock</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 p-2 rounded text-indigo-600">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-tighter">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-right text-gray-600">PKR {product.costPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-semibold text-indigo-600">PKR {product.salePrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      product.stockCount <= product.lowStockThreshold ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {product.stockCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.stockCount <= product.lowStockThreshold ? (
                      <span className="text-rose-600 flex items-center space-x-1 text-sm font-medium">
                        <AlertCircle size={14} />
                        <span>Low Stock</span>
                      </span>
                    ) : (
                      <span className="text-green-600 text-sm font-medium">Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No products found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU Code</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (PKR)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.costPrice || ''}
                    onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (PKR)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.salePrice || ''}
                    onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Warning At</label>
                <input 
                  required
                  type="number" 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.lowStockThreshold || ''}
                  onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
