
import React, { useState } from 'react';
import { useStore } from '../store';
import { ShieldCheck, Mail, Lock, LogIn, UserPlus, AlertCircle, Package, CloudOff } from 'lucide-react';

const Login = () => {
  const { actions } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await actions.login(email, password);
        if (!success) {
          setError('Invalid credentials. If cloud is not set up, use the Demo accounts below.');
          setLoading(false);
        }
      } else {
        const success = await actions.register(email, password);
        if (success) {
          setIsLogin(true);
          setError('Staff account created successfully! Please sign in.');
        } else {
          setError('Cloud registration is disabled while using placeholder config.');
        }
        setLoading(false);
      }
    } catch (err) {
      setError('System error. Please try the Demo login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 text-center bg-gray-50/50 border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-6 transition-transform hover:scale-105 duration-300">
            <Package size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Royal Threads</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Enterprise Accounts Manager</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
            <CloudOff className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Cloud Offline Mode</p>
              <p className="text-[10px] text-amber-700 font-medium">Use demo credentials below to access immediately. Data will save to your browser.</p>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-bold animate-in slide-in-from-top-4 duration-300 ${error.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
              {error.includes('successfully') ? <ShieldCheck size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              <span className="leading-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Corporate Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  required
                  type="email"
                  placeholder="admin@royalthreads.com"
                  className="w-full pl-12 pr-5 py-4.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-900 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-900 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-[0.1em]">{isLogin ? 'Access Dashboard' : 'Create Staff Profile'}</span>
                  {isLogin ? <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={20} />}
                </>
              )}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-gray-50">
            <div className="flex items-center justify-center space-x-2 text-indigo-400 mb-2">
              <ShieldCheck size={14} />
              <p className="text-[10px] font-black uppercase tracking-widest">Master Credentials</p>
            </div>
            <div className="grid grid-cols-1 gap-2 bg-indigo-50/50 p-4 rounded-2xl">
              <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                <span className="text-indigo-600">Admin:</span> royalthreads.pvt@gmail.com / 033148
              </div>
              <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                <span className="text-indigo-600">Staff:</span> ilyassidhu151@gmail.com / 151151
              </div>
            </div>
            <p className="text-[8px] text-indigo-300 mt-4 uppercase font-black">
              Enterprise Cloud v6.0 • Royal Threads Pvt. Ltd
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
