
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Scan, X, CheckCircle, AlertCircle, Package, Truck, CornerDownLeft } from 'lucide-react';

interface ScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isOpen, onClose }) => {
  const { actions } = useStore();
  const [scanValue, setScanValue] = useState('');
  const [feedback, setFeedback] = useState<{ message: string, type: 'NEW' | 'RETURN' | 'ERROR' | null }>({ message: '', type: null });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanValue) return;

    const result = actions.processScanData(scanValue);
    setFeedback({ message: result.message, type: result.type });
    setScanValue('');

    // Clear feedback after 3 seconds
    setTimeout(() => {
      setFeedback({ message: '', type: null });
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative border border-white/20">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"
        >
          <X size={24} />
        </button>

        <div className="p-8 text-center space-y-6">
          <div className="relative inline-block">
            <div className={`p-6 rounded-3xl ${
              feedback.type === 'NEW' ? 'bg-blue-100 text-blue-600' :
              feedback.type === 'RETURN' ? 'bg-amber-100 text-amber-600' :
              feedback.type === 'ERROR' ? 'bg-rose-100 text-rose-600' :
              'bg-indigo-100 text-indigo-600'
            } transition-colors duration-500`}>
              {feedback.type === 'NEW' ? <Package size={48} /> :
               feedback.type === 'RETURN' ? <CornerDownLeft size={48} /> :
               feedback.type === 'ERROR' ? <AlertCircle size={48} /> :
               <Scan size={48} className="animate-pulse" />}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {feedback.type ? 'Parcel Processed' : 'Scan Label Barcode'}
            </h3>
            <p className="text-gray-500 mt-1">
              {feedback.message || 'The system will automatically detect the courier, customer, and order status.'}
            </p>
          </div>

          <form onSubmit={handleScan} className="relative group">
            <input
              ref={inputRef}
              autoFocus
              type="text"
              placeholder="Waiting for scanner input..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-5 text-lg font-mono text-center focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-gray-300 group-focus-within:text-indigo-500">
              <span className="text-xs font-bold border rounded px-1.5 py-0.5">ENTER</span>
            </div>
          </form>

          <div className="flex justify-center space-x-8 pt-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Truck size={14} className="text-indigo-400" />
              <span>TCS SUPPORTED</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Truck size={14} className="text-orange-400" />
              <span>POSTEX SUPPORTED</span>
            </div>
          </div>
        </div>

        {feedback.type && (
          <div className={`p-4 text-center text-sm font-bold animate-in slide-in-from-bottom-full ${
            feedback.type === 'NEW' ? 'bg-blue-600 text-white' :
            feedback.type === 'RETURN' ? 'bg-amber-600 text-white' :
            'bg-rose-600 text-white'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle size={16} />
              <span>{feedback.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerOverlay;
