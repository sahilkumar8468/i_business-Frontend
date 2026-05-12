import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ShoppingCart, Plus, Loader2, Calendar, Coffee, Home as HomeIcon, Zap, Utensils, Heart, Car, Search } from 'lucide-react';
import { expenseService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const HomeExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await expenseService.addExpense(formData);
      setIsModalOpen(false);
      setFormData({ category: 'food', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      fetchExpenses();
    } catch (err) {
      alert('Failed to add expense');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalMonthlyExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return <Utensils size={18} />;
      case 'rent': return <HomeIcon size={18} />;
      case 'utilities': return <Zap size={18} />;
      case 'health': return <Heart size={18} />;
      case 'transport': return <Car size={18} />;
      default: return <Coffee size={18} />;
    }
  };

  return (
    <DashboardLayout>
      <div className={`space-y-8 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('expenses')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track your daily household spending and monthly bills.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Plus size={20} />
            {t('logExpense')}
          </button>
        </div>

        {/* Expenses Summary */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
           <div className="card bg-slate-900 text-white p-6 col-span-1 flex flex-col justify-between">
              <div>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Monthly Spending</p>
                 <p className="text-3xl font-black">{formatCurrency(totalMonthlyExpenses)}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm font-bold">
                 <Zap size={16} />
                 <span>On track for this month</span>
              </div>
           </div>
           
           <div className="card p-6 md:col-span-2 flex flex-col justify-center dark:bg-slate-800 dark:border-slate-700">
              <div className={`flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide ${isRTL ? 'flex-row-reverse' : ''}`}>
                 {['food', 'rent', 'utilities', 'health', 'transport'].map(cat => (
                    <div key={cat} className="flex flex-col items-center gap-2 min-w-[80px]">
                       <div className="p-4 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {getCategoryIcon(cat)}
                       </div>
                       <span className="text-[10px] font-bold uppercase text-slate-400">{t(cat)}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Recent Expenses List */}
        <div className="card overflow-hidden p-0 dark:bg-slate-800 dark:border-slate-700">
           <div className={`p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
              <div className="flex items-center gap-2">
                 <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all">
                    <Calendar size={18} />
                  </button>
                  <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all">
                    <Search size={18} />
                  </button>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <th className={`p-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>{t('date')}</th>
                    <th className={`p-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>{t('category')}</th>
                    <th className={`p-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>{t('notes')}</th>
                    <th className={`p-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {isLoading ? (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td></tr>
                  ) : expenses.length === 0 ? (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-400">{t('noEntries')}</td></tr>
                  ) : (
                     expenses.map((exp) => (
                       <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                         <td className={`p-4 text-sm text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : ''}`}>
                           {new Date(exp.date).toLocaleDateString(language === 'en' ? 'en-US' : (language === 'ur' ? 'ur-PK' : 'sd-PK'), { day: '2-digit', month: 'short' })}
                         </td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                                 {getCategoryIcon(exp.category)}
                              </div>
                              <span className="text-sm font-bold text-slate-700 capitalize">{exp.category}</span>
                           </div>
                        </td>
                        <td className="p-4 text-sm text-slate-500 italic max-w-xs truncate">
                           {exp.description || 'No notes'}
                        </td>
                        <td className="p-4 text-sm font-black text-slate-900 text-right">
                           {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{language === 'en' ? 'New Expense' : (language === 'ur' ? 'نیا خرچہ' : 'نئون خرچ')}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Log a new household or personal expenditure.</p>
              
              <form onSubmit={handleSubmit} className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
                <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                   <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('category')}</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                    >
                      <option value="food">{t('food')}</option>
                      <option value="rent">{t('rent')}</option>
                      <option value="utilities">{t('utilities')}</option>
                      <option value="health">{t('health')}</option>
                      <option value="transport">{t('transport')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('amount')} (PKR)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="Amount"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-[var(--color-txt-main)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('date')}</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('notes')}</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="What was this for?"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium h-24 text-[var(--color-txt-main)]"
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
                    className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all"
                  >
                    {t('logExpense')}
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

export default HomeExpensesPage;
