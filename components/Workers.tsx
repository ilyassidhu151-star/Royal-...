
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, UserCheck, Trash2, Edit2, X, DollarSign } from 'lucide-react';
import { Worker } from '../types';

const Workers = () => {
  const { state, actions } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    perOrderRate: 100
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker) {
      actions.updateWorker(editingWorker.id, formData);
    } else {
      actions.addWorker(formData);
    }
    closeModal();
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({ name: worker.name, perOrderRate: worker.perOrderRate });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorker(null);
    setFormData({ name: '', perOrderRate: 100 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Worker Management</h2>
          <p className="text-gray-500">Manage your staff and their commission rates.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Add Worker</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.workers.map(worker => (
          <div key={worker.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                <UserCheck size={24} />
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => handleEdit(worker)} className="p-2 text-gray-400 hover:text-indigo-600">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => actions.removeWorker(worker.id)} className="p-2 text-gray-400 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{worker.name}</h3>
            <div className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
              <DollarSign size={14} className="mr-1" />
              <span>PKR {worker.perOrderRate} per order</span>
            </div>
          </div>
        ))}
        {state.workers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed flex flex-col items-center">
            <UserCheck size={48} className="mb-2 opacity-20" />
            <p>No workers added yet. Add staff to assign them orders.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Worker Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per Order Payment (Commission)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">PKR</span>
                  <input 
                    required
                    type="number" 
                    className="w-full border rounded-lg pl-12 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.perOrderRate || ''}
                    onChange={e => setFormData({...formData, perOrderRate: Number(e.target.value)})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                {editingWorker ? 'Update Worker' : 'Save Worker'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
