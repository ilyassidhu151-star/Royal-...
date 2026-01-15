
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Wallet, Tag, Calendar, FileText, CreditCard } from 'lucide-react';
import { ExpenseCategory, CashAccount } from '../types';

const Expenses = () => {
  const { state, actions, computed } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: ExpenseCategory.MISC,
    amount: 0,
    note: '',
    account: CashAccount.MAIN
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.addExpense(formData);
    setIsModalOpen(false);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      category: ExpenseCategory.MISC, 
      amount: 0, 
      note: '',
      account: CashAccount.MAIN
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Expenses</h2>
          <p className="text-gray-500">Track bills, rent, and advertising costs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Total Expenses</h3>
            <p className="text-3xl font-bold text-rose-600">PKR {computed.totalExpenses.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Deducted from business profit</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">By Category</h3>
            <div className="space-y-3">
              {Object.values(ExpenseCategory).map(cat => {
                const amount = state.expenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);
                return (
                  <div key={cat} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{cat}</span>
                    <span className="font-bold text-gray-900">PKR {amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.expenses.slice().reverse().map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">{expense.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      expense.account === CashAccount.MAIN ? 'bg-indigo-50 text-indigo-700' : 'bg-sky-50 text-sky-700'
                    }`}>
                      {expense.account.split(' ')[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{expense.category}</p>
                    <p className="text-xs text-gray-400 truncate w-32">{expense.note}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-rose-600 whitespace-nowrap">PKR {expense.amount.toLocaleString()}</td>
                </tr>
              ))}
              {state.expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No expenses recorded.</td>
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
              <h3 className="text-xl font-bold text-gray-900">Add New Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input required type="date" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                  <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                    value={formData.account}
                    onChange={e => setFormData({...formData, account: e.target.value as CashAccount})}>
                    <option value={CashAccount.MAIN}>Main Cash</option>
                    <option value={CashAccount.AD}>Ad Cash</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm"
                  value={formData.category} onChange={e => {
                    const cat = e.target.value as ExpenseCategory;
                    const account = cat === ExpenseCategory.ADS ? CashAccount.AD : CashAccount.MAIN;
                    setFormData({...formData, category: cat, account});
                  }}>
                  {Object.values(ExpenseCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
                <input required type="number" min="1" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea rows={2} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="e.g. Electricity bill for July"
                  value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
                Record Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
