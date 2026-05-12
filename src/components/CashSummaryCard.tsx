import React, { useState, useEffect } from 'react';
import { Wallet, Landmark, TrendingUp, Home, Briefcase, ExternalLink, Loader2 } from 'lucide-react';
import { cashService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CashSummaryCard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await cashService.getCashSummary();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load cash summary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="card h-full flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card h-full flex flex-col items-center justify-center py-12 text-center">
        <p className="text-rose-500 font-medium mb-4">{error || 'No data available'}</p>
        <button onClick={fetchData} className="btn-primary text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Wallet size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Total Cash in Hand</h2>
        </div>
        <button 
          onClick={() => navigate('/cash')}
          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
          title="Manage Cash"
        >
          <ExternalLink size={18} />
        </button>
      </div>

      <div className="mb-8">
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Liquid Assets Summary</div>
        <div className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
          {formatCurrency(data?.total || 0)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Business */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
          <div className="flex items-center gap-2 mb-1 text-blue-600">
            <Briefcase size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Business</span>
          </div>
          <div className="text-base font-bold text-slate-800">{formatCurrency(data.business)}</div>
        </div>

        {/* Stocks */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all">
          <div className="flex items-center gap-2 mb-1 text-emerald-600">
            <TrendingUp size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Stocks</span>
          </div>
          <div className="text-base font-bold text-slate-800">{formatCurrency(data.stocks)}</div>
        </div>

        {/* Bank */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 transition-all">
          <div className="flex items-center gap-2 mb-1 text-amber-600">
            <Landmark size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Bank</span>
          </div>
          <div className="text-base font-bold text-slate-800">{formatCurrency(data.bank)}</div>
        </div>

        {/* Home */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all">
          <div className="flex items-center gap-2 mb-1 text-purple-600">
            <Home size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </div>
          <div className="text-base font-bold text-slate-800">{formatCurrency(data.home)}</div>
        </div>
      </div>
    </div>
  );
};

export default CashSummaryCard;
