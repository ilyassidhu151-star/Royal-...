
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Minus, ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, History } from 'lucide-react';
import { CashAccount, TransactionType } from '../types';

const CashLedger = () => {
  const { state, actions } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: TransactionType.IN,
    account: CashAccount.MAIN
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.addLedgerEntry(formData);
    setIsModalOpen(false);
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      description: '', 
      amount: 0, 
      type: TransactionType.IN, 
      account: CashAccount.MAIN 
    });
  };

  const AccountCard = ({ name, balance, icon: Icon, color }: { name: string, balance: number, icon: any, color: string }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${color}`} />
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-xl ${color} text-white`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{name}</h3>
          <p className="text-2xl font-bold text-gray-900">PKR {balance.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => {
            setFormData({ ...formData, account: name as CashAccount, type: TransactionType.IN });
            setIsModalOpen(true);
          }}
          className="flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-bold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition"
        >
          <Plus size={14} /> <span>Add Cash</span>
        </button>
        <button 
          onClick={() => {
            setFormData({ ...formData, account: name as CashAccount, type: TransactionType.OUT });
            setIsModalOpen(true);
          }}
          className="flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
        >
          <Minus size={14} /> <span>Withdraw</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Cash Ledger</h2>
          <p className="text-gray-500">Monitor all cash movements across business accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountCard 
          name={CashAccount.MAIN} 
          balance={state.mainCashBalance} 
          icon={Wallet} 
          color="bg-indigo-600" 
        />
        <AccountCard 
          name={CashAccount.AD} 
          balance={state.adCashBalance} 
          icon={CreditCard} 
          color="bg-sky-500" 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <History size={20} className="mr-2 text-indigo-600" />
            Transaction History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.cashTransactions.slice().reverse().map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      tx.account === CashAccount.MAIN ? 'bg-indigo-50 text-indigo-700' : 'bg-sky-50 text-sky-700'
                    }`}>
                      {tx.account}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{tx.description}</td>
                  <td className="px-6 py-4 text-right">
                    <div className={`flex items-center justify-end space-x-1 font-bold ${
                      tx.type === TransactionType.IN ? 'text-green-600' : 'text-rose-600'
                    }`}>
                      {tx.type === TransactionType.IN ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      <span>PKR {tx.amount.toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {state.cashTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No transactions recorded.</td>
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
              <h3 className="text-xl font-bold text-gray-900">
                {formData.type === TransactionType.IN ? 'Add Cash' : 'Withdraw Cash'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <select 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.account}
                  onChange={e => setFormData({...formData, account: e.target.value as CashAccount})}
                >
                  <option value={CashAccount.MAIN}>Main Cash</option>
                  <option value={CashAccount.AD}>Ad Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input required type="date" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Reason for transaction..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
                <input required type="number" min="1" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg transition ${
                formData.type === TransactionType.IN ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}>
                Confirm Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashLedger;
