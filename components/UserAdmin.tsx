
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  ShieldAlert, 
  History, 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Filter,
  Activity,
  UserX,
  Smartphone
} from 'lucide-react';

const UserAdmin = () => {
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState<'users' | 'history'>('users');
  const [search, setSearch] = useState('');

  const users = useMemo(() => {
    return state.users.map(u => {
      // Check if user is active (mock logic: last login within 30 mins)
      const isOnline = u.lastLogin && (new Date().getTime() - new Date(u.lastLogin).getTime() < 1800000);
      return { ...u, isOnline };
    });
  }, [state.users]);

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredHistory = state.loginAttempts.filter(a => a.email.toLowerCase().includes(search.toLowerCase()));

  const stats = useMemo(() => {
    return {
      total: state.users.length,
      online: users.filter(u => u.isOnline).length,
      never: users.filter(u => !u.lastLogin).length,
      failed: state.loginAttempts.filter(a => !a.success).length
    };
  }, [users, state.loginAttempts]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Security & Access Management</h2>
        <p className="text-gray-500">Monitor staff login activity and identify device sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Registered Staff</p>
          <div className="flex items-end space-x-2"><h3 className="text-3xl font-black text-gray-900">{stats.total}</h3><span className="text-xs font-bold text-indigo-500 pb-1">Total</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Now</p>
          <div className="flex items-end space-x-2"><h3 className="text-3xl font-black text-emerald-600">{stats.online}</h3><span className="text-xs font-bold text-emerald-500 pb-1">Live</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Idle Users</p>
          <div className="flex items-end space-x-2"><h3 className="text-3xl font-black text-amber-500">{stats.never}</h3><span className="text-xs font-bold text-amber-400 pb-1">Idle</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Alerts</p>
          <div className="flex items-end space-x-2"><h3 className="text-3xl font-black text-rose-600">{stats.failed}</h3><span className="text-xs font-bold text-rose-500 pb-1">Failed</span></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>Directory</button>
            <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>Auth Logs</button>
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search logs..." className="pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'users' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-widest">
                <tr><th className="px-6 py-4">Status</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Created</th><th className="px-6 py-4 text-right">Last Login</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{user.isOnline ? 'Online' : 'Offline'}</span></td>
                    <td className="px-6 py-4 font-bold">{user.email}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-widest">
                <tr><th className="px-6 py-4">Time</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Device/Platform</th><th className="px-6 py-4">Result</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map(attempt => (
                  <tr key={attempt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 font-mono">{new Date(attempt.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold">{attempt.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-gray-600">
                        <Smartphone size={12} className="mr-1 text-gray-400" />
                        <span className="truncate max-w-[200px]">{attempt.deviceId || 'Unknown Device'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${attempt.success ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>{attempt.success ? 'Success' : 'Failed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAdmin;
