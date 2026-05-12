import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ShoppingBag, Plus, Loader2, Search, Filter, MoreVertical } from 'lucide-react';
import { businessService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const BusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const navigate = useNavigate();
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      const data = await businessService.getBusinesses();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch businesses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName) return;
    try {
      await businessService.createBusiness({ name: newBizName });
      setNewBizName('');
      setIsModalOpen(false);
      fetchBusinesses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create business');
    }
  };

  return (
    <DashboardLayout>
      <div className={`space-y-8 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('businesses')}</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and track your business ventures.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Plus size={20} />
            {t('addBusiness')}
          </button>
        </div>

        {/* Filters and Search */}
        <div className={`flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--color-surface)] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className="relative w-full md:w-96">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
            <input 
              type="text" 
              placeholder={t('search')} 
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-[var(--color-txt-main)]`}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-24">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : businesses.length === 0 ? (
            <div className="col-span-full card text-center py-24 flex flex-col items-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-300 dark:text-slate-700 mb-4">
                <ShoppingBag size={64} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No businesses yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Start by adding your first business venture.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary px-8"
              >
                {t('addBusiness')}
              </button>
            </div>
          ) : (
            businesses.map((biz) => (
              <div 
                key={biz.id} 
                onClick={() => navigate(`/businesses/${biz.id}`)}
                className="card hover:shadow-xl hover:shadow-primary/5 hover:border-primary transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-4`}>
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
                <div className={`flex items-start gap-4 mb-6 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{biz.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(biz.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : (language === 'ur' ? 'ur-PK' : 'sd-PK'), { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800 ${isRTL ? 'text-right' : ''}`}>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'en' ? 'Status' : (language === 'ur' ? 'حالت' : 'حالت')}</p>
                    <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      {t('active')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'en' ? 'Role' : (language === 'ur' ? 'کردار' : 'ڪردار')}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{language === 'en' ? 'Owner' : (language === 'ur' ? 'مالک' : 'مالڪ')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Business Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('addBusiness')}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Enter the details of your new business venture.</p>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('businessName')}</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="e.g. Blue Horizon Tech"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                  />
                </div>
                
                <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BusinessesPage;
