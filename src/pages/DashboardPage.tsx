import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Plus,
  Loader2,
  CreditCard,
  Gem,
  ShoppingCart,
  PieChart,
  ArrowRight,
  Building2
} from 'lucide-react';
import { businessService, assetService, expenseService, cashService } from '../services/api';
import CashSummaryCard from '../components/CashSummaryCard';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const DashboardPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cash, setCash] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [bizData, assetData, expData, cashData] = await Promise.all([
          businessService.getBusinesses(),
          assetService.getAssets(),
          expenseService.getExpenses(),
          cashService.getCashSummary()
        ]);
        setBusinesses(bizData);
        setAssets(assetData);
        setExpenses(expData);
        setCash(cashData);
      } catch (err) {
        console.error('Dashboard Data Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalAssets = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalCash = cash?.total || 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`space-y-8 animate-in fade-in duration-700 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('overview')}</h1>
            <p className="text-slate-500 mt-1">{t('welcomeBack')}, Alex. Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => navigate('/expenses')} className="btn-secondary flex items-center gap-2">
                <ShoppingCart size={18} />
                {t('logExpense')}
             </button>
             <button onClick={() => navigate('/businesses')} className="btn-primary flex items-center gap-2">
                <Plus size={18} />
                {t('newEntry')}
             </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Total Cash */}
           <div className="card bg-slate-900 text-white p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className={`absolute ${isRTL ? '-left-4' : '-right-4'} -bottom-4 opacity-10 group-hover:scale-110 transition-transform`}>
                 <CreditCard size={80} />
              </div>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{t('totalCash')}</p>
              <h3 className="text-2xl font-black">{formatCurrency(totalCash)}</h3>
              <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                 <ArrowUpRight size={14} className={isRTL ? 'rotate-[-90deg]' : ''} />
                 <span>Liquid</span>
              </div>
           </div>

           {/* Total Assets */}
           <div className="card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className={`absolute ${isRTL ? '-left-4' : '-right-4'} -bottom-4 text-primary/5 group-hover:scale-110 transition-transform`}>
                 <Gem size={80} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{t('totalAssets')}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(totalAssets)}</h3>
              <div className="mt-4 flex items-center gap-1 text-blue-500 text-xs font-bold">
                 <Building2 size={14} className="inline mr-1" />
                 <span>{assets.length} Items</span>
              </div>
           </div>

           {/* Home Expenses */}
           <div className="card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className={`absolute ${isRTL ? '-left-4' : '-right-4'} -bottom-4 text-rose-500/5 group-hover:scale-110 transition-transform`}>
                 <ShoppingCart size={80} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{t('expenses')}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(totalExpenses)}</h3>
              <div className="mt-4 flex items-center gap-1 text-rose-500 text-xs font-bold">
                 <ArrowDownRight size={14} className={isRTL ? 'rotate-[-90deg]' : ''} />
                 <span>This Month</span>
              </div>
           </div>

           {/* Total Businesses */}
           <div className="card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className={`absolute ${isRTL ? '-left-4' : '-right-4'} -bottom-4 text-emerald-500/5 group-hover:scale-110 transition-transform`}>
                 <ShoppingBag size={80} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{t('businesses')}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{businesses.length}</h3>
              <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                 <TrendingUp size={14} />
                 <span>Active Ventures</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Detailed Cash Summary */}
           <div className="lg:col-span-2">
              <CashSummaryCard />
           </div>

           {/* Quick Actions / Recent Activity */}
           <div className="card space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <PieChart size={20} className="text-primary" />
                 Portfolio Distribution
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate('/cash')}>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-white rounded-lg text-slate-600 shadow-sm"><CreditCard size={16} /></div>
                       <span className="text-sm font-bold text-slate-700">Cash Balance</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-300" />
                 </div>
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate('/assets')}>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-white rounded-lg text-slate-600 shadow-sm"><Gem size={16} /></div>
                       <span className="text-sm font-bold text-slate-700">Property & Assets</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-300" />
                 </div>
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate('/businesses')}>
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-white rounded-lg text-slate-600 shadow-sm"><ShoppingBag size={16} /></div>
                       <span className="text-sm font-bold text-slate-700">Business Units</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-300" />
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Market Outlook</p>
                 <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
                    <h4 className="font-bold mb-1">Growth Forecast</h4>
                    <p className="text-white/80 text-xs mb-4">Based on your recent business activities, your portfolio is expected to grow by 12%.</p>
                    <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20">
                       View Analysis
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Recent Transactions Placeholder or further details */}
        <div className="card overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recent Business Ventures</h3>
            <button onClick={() => navigate('/businesses')} className="text-primary font-semibold text-sm hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {businesses.slice(0, 3).map(biz => (
                <div key={biz.id} className="p-4 border border-slate-100 rounded-2xl hover:border-primary transition-all cursor-pointer group" onClick={() => navigate(`/businesses/${biz.id}`)}>
                   <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:scale-110 transition-transform">
                         <ShoppingBag size={18} />
                      </div>
                      <h4 className="font-bold text-slate-900">{biz.name}</h4>
                   </div>
                   <div className="flex justify-between text-xs text-slate-500">
                      <span>Status: Active</span>
                      <span>Created: {new Date(biz.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
