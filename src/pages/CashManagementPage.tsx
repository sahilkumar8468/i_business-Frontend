import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Wallet, Landmark, TrendingUp, Home, Briefcase, Plus, Loader2, Save, ArrowLeft } from 'lucide-react';
import { cashService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const CashManagementPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    business: 0,
    stocks: 0,
    bank: 0,
    home: 0
  });
  const navigate = useNavigate();
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await cashService.getCashSummary();
        setData(res);
        setFormData({
          business: res.business || 0,
          stocks: res.stocks || 0,
          bank: res.bank || 0,
          home: res.home || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await cashService.updateCashSummary(formData);
      alert(language === 'en' ? 'Cash management updated successfully!' : (language === 'ur' ? 'نقد انتظام کامیابی سے اپ ڈیٹ ہو گیا!' : 'نقد انتظام ڪاميابي سان اپڊيٽ ٿي ويو!'));
    } catch (err) {
      alert(language === 'en' ? 'Failed to update cash management' : (language === 'ur' ? 'اپ ڈیٹ کرنے میں ناکام' : 'اپڊيٽ ڪرڻ ۾ ناڪام'));
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalCash = Object.values(formData).reduce((a, b) => a + b, 0);

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
      <div className={`max-w-4xl mx-auto space-y-8 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('cashManagement')}</h1>
              <p className="text-slate-500 dark:text-slate-400">{t('cashManagementDesc')}</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {t('save')}
          </button>
        </div>

        {/* Summary Card */}
        <div className="card bg-slate-900 text-white p-8 overflow-hidden relative group">
          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-8 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-medium uppercase tracking-widest text-sm mb-2">{t('totalCash')}</p>
            <h2 className="text-5xl font-black tracking-tight">{formatCurrency(totalCash)}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Investments */}
          <div className="card space-y-4 border-t-4 border-blue-500 dark:bg-slate-800 dark:border-x-slate-700 dark:border-b-slate-700">
            <div className={`flex items-center gap-3 text-blue-600 dark:text-blue-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Briefcase size={24} />
              <h3 className="text-xl font-bold">{t('businessInvestments')}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('businessInvestmentsDesc')}</p>
            <div className="relative">
              <span className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 font-bold`}>Rs.</span>
              <input 
                type="number"
                value={formData.business}
                onChange={(e) => setFormData({...formData, business: Number(e.target.value)})}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-lg text-[var(--color-txt-main)]`}
              />
            </div>
          </div>

          {/* Stock Market */}
          <div className="card space-y-4 border-t-4 border-emerald-500 dark:bg-slate-800 dark:border-x-slate-700 dark:border-b-slate-700">
            <div className={`flex items-center gap-3 text-emerald-600 dark:text-emerald-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendingUp size={24} />
              <h3 className="text-xl font-bold">{t('stocks')}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('stocksDesc')}</p>
            <div className="relative">
              <span className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 font-bold`}>Rs.</span>
              <input 
                type="number"
                value={formData.stocks}
                onChange={(e) => setFormData({...formData, stocks: Number(e.target.value)})}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-lg text-[var(--color-txt-main)]`}
              />
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="card space-y-4 border-t-4 border-amber-500 dark:bg-slate-800 dark:border-x-slate-700 dark:border-b-slate-700">
            <div className={`flex items-center gap-3 text-amber-600 dark:text-amber-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Landmark size={24} />
              <h3 className="text-xl font-bold">{t('bankBalance')}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('bankBalanceDesc')}</p>
            <div className="relative">
              <span className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 font-bold`}>Rs.</span>
              <input 
                type="number"
                value={formData.bank}
                onChange={(e) => setFormData({...formData, bank: Number(e.target.value)})}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-lg text-[var(--color-txt-main)]`}
              />
            </div>
          </div>

          {/* Home Cash */}
          <div className="card space-y-4 border-t-4 border-purple-500 dark:bg-slate-800 dark:border-x-slate-700 dark:border-b-slate-700">
            <div className={`flex items-center gap-3 text-purple-600 dark:text-purple-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Home size={24} />
              <h3 className="text-xl font-bold">{t('homeCash')}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('homeCashDesc')}</p>
            <div className="relative">
              <span className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 font-bold`}>Rs.</span>
              <input 
                type="number"
                value={formData.home}
                onChange={(e) => setFormData({...formData, home: Number(e.target.value)})}
                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-lg text-[var(--color-txt-main)]`}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CashManagementPage;
