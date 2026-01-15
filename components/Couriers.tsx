
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Truck, Download, Calendar, DollarSign } from 'lucide-react';
import { Courier, OrderStatus } from '../types';

const Couriers = () => {
  const { state, actions, computed } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    courier: Courier.TCS,
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.addCourierPayment(formData);
    setIsModalOpen(false);
    setFormData({ date: new Date().toISOString().split('T')[0], courier: Courier.TCS, amount: 0 });
  };

  const CourierLedger = ({ type }: { type: Courier }) => {
    const receivable = computed.getCourierReceivable(type);
    const courierPayments = state.courierPayments.filter(p => p.courier === type).reverse();
    const courierOrders = state.orders.filter(o => o.courier === type && o.status === OrderStatus.DELIVERED);
    const deliveredValue = courierOrders.reduce((acc, o) => acc + (o.salePrice * o.quantity), 0);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className={`p-6 ${type === Courier.TCS ? 'bg-indigo-700' : 'bg-orange-600'} text-white`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold flex items-center">
              <Truck className="mr-2" /> {type} Ledger
            </h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Live Receivable
            </span>
          </div>
          <p className="text-4xl font-bold">PKR {receivable.toLocaleString()}</p>
          <div className="mt-4 flex justify-between text-white/80 text-sm border-t border-white/20 pt-4">
            <div>
              <p>Total Delivered</p>
              <p className="font-bold text-white">PKR {deliveredValue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p>Total Withdrawn</p>
              <p className="font-bold text-white">PKR {(deliveredValue - receivable).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment History</h4>
          <div className="space-y-3">
            {courierPayments.map(payment => (
              <div key={payment.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <Download size={14} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">PKR {payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{payment.date}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded font-bold uppercase">Received</span>
              </div>
            ))}
            {courierPayments.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm italic">No payment logs for {type}.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Courier Management</h2>
          <p className="text-gray-500">Manage cash collection from TCS and PostEx.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Record Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CourierLedger type={Courier.TCS} />
        <CourierLedger type={Courier.POSTEX} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Record Courier Payment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Calendar size={14} className="mr-1" /> Payment Date
                </label>
                <input required type="date" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Courier</label>
                <select required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.courier} onChange={e => setFormData({...formData, courier: e.target.value as Courier})}>
                  <option value={Courier.TCS}>TCS</option>
                  <option value={Courier.POSTEX}>PostEx</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <DollarSign size={14} className="mr-1" /> Amount Received (PKR)
                </label>
                <input required type="number" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
                Receive Cash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Couriers;
