import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Settings, 
  FileText, 
  BarChart, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Save, 
  Loader2, 
  ArrowLeft,
  ChevronRight,
  Filter,
  FileUp,
  Users,
  Edit,
  Clock
} from 'lucide-react';
import { businessService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const BusinessDetailsPage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any>(null);
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entries' | 'config' | 'reports' | 'partners'>('entries');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // Field Config State
  const [configFields, setConfigFields] = useState<any[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newAccountingType, setNewAccountingType] = useState('neutral');
  
  // Entry Form State
  const [entryForm, setEntryForm] = useState<any>({});
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setCurrentUser(await res.json());
      } catch (err) {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      setIsLoading(true);
      const biz = await businessService.getBusinessDetails(businessId!);
      setBusiness(biz);
      setConfigFields(biz.config?.fields || []);
      
      try {
        const entriesData = await businessService.getBusinessEntries(businessId!, {});
        setEntries(entriesData);
      } catch (entriesErr: any) {
        console.error('Failed to fetch entries:', entriesErr.response?.data?.error || entriesErr.message);
        toast.error('Could not load entries: ' + (entriesErr.response?.data?.error || 'Permission denied'));
      }
      
      try {
        const profit = await businessService.getBusinessProfit(businessId!);
        setProfitData(profit);
      } catch (profitErr: any) {
        console.error('Failed to fetch profit:', profitErr.response?.data?.error || profitErr.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load business: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      const newConfig = { ...business.config, fields: configFields };
      await businessService.updateBusinessConfig(businessId!, newConfig);
      alert(language === 'en' ? 'Configuration updated successfully!' : (language === 'ur' ? 'ترتیب کامیابی سے محفوظ ہو گئی!' : 'ترتيب ڪاميابي سان محفوظ ٿي وئي!'));
      fetchBusinessData();
    } catch (err) {
      alert(language === 'en' ? 'Failed to update configuration' : (language === 'ur' ? 'ترتیب محفوظ کرنے میں ناکام' : 'ترتيب محفوظ ڪرڻ ۾ ناڪام'));
    }
  };

  const addField = () => {
    if (!newFieldName) return;
    const key = newFieldName.toLowerCase().replace(/\s+/g, '_');
    if (configFields.find(f => f.key === key)) {
      alert(language === 'en' ? 'Field already exists' : (language === 'ur' ? 'فیلڈ پہلے سے موجود ہے' : 'فيلڊ اڳ ۾ ئي موجود آھي'));
      return;
    }
    setConfigFields([...configFields, { name: newFieldName, key, type: newFieldType, accountingType: newAccountingType }]);
    setNewFieldName('');
  };

  const removeField = (key: string) => {
    setConfigFields(configFields.filter(f => f.key !== key));
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await businessService.deleteEntry(businessId!, entryId);
      toast.success('Entry deleted successfully');
      fetchBusinessData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete entry');
    }
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntryId(entry.id);
    setEntryForm(entry);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingEntry(true);
      if (editingEntryId) {
        await businessService.updateEntry(businessId!, editingEntryId, entryForm);
        toast.success('Entry updated successfully');
      } else {
        await businessService.addBusinessEntry(businessId!, entryForm);
        toast.success('Entry added successfully');
      }
      setIsEntryModalOpen(false);
      setEntryForm({});
      setEditingEntryId(null);
      fetchBusinessData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save entry');
    } finally {
      setIsSavingEntry(false);
    }
  };

  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(
    language === 'en' ? 'en-PK' : 'ur-PK',
    {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }
  ).format(amount);
};

  const exportToCSV = () => {
    if (entries.length === 0) return;
    const headers = ['Date', ...configFields.map(f => f.name)].join(',');
    const rows = entries.map(entry => {
      const date = new Date(entry.createdAt).toLocaleDateString();
      const vals = configFields.map(f => entry[f.key] || '');
      return [date, ...vals].join(',');
    });
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business.name}_report.csv`;
    a.click();
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse md:flex-row-reverse text-right' : ''}`}>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={() => navigate('/businesses')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{business.name}</h1>
              <div className={`flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-bold text-[10px] uppercase">{t('active')}</span>
                <span>•</span>
                <span>{language === 'en' ? 'Created' : (language === 'ur' ? 'بنایا گیا' : 'ٺاهيو ويو')} {new Date(business.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : (language === 'ur' ? 'ur-PK' : 'sd-PK'))}</span>
              </div>
            </div>
          </div>
          
          <div className={`flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button 
              onClick={() => setActiveTab('entries')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'entries' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText size={18} />
              {t('entries')}
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <BarChart size={18} />
              Overview
            </button>
            {business?.currentUserRole !== 'employee' && (
              <>
                <button 
                  onClick={() => setActiveTab('config')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Settings size={18} />
                  {t('setupFields')}
                </button>
                <button 
                  onClick={() => setActiveTab('partners')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'partners' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Users size={18} />
                  Partners
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className={`card dark:bg-slate-800 dark:border-slate-700 ${isRTL ? 'text-right' : ''}`}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('fieldConfig')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">{t('fieldConfigDesc')}</p>
                
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('fieldName')}</label>
                    <input 
                      type="text" 
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g. Bike Model, Price, Customer Name"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-[var(--color-txt-main)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('fieldType')}</label>
                    <select 
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                    >
                      <option value="text">{t('text')}</option>
                      <option value="number">{t('number')}</option>
                      <option value="date">{t('date')}</option>
                      <option value="file">{t('file')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('accounting')}</label>
                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <select 
                        value={newAccountingType}
                        onChange={(e) => setNewAccountingType(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                      >
                        <option value="neutral">{t('neutral')}</option>
                        <option value="income">{t('income')}</option>
                        <option value="expense">{t('expense')}</option>
                      </select>
                      <button onClick={addField} className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('currentFields')}</h4>
                  {configFields.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                      <Settings size={48} className="mb-2 opacity-20" />
                      <p>{t('noFieldsDefined')}</p>
                    </div>
                  ) : (
                    configFields.map((field, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-primary shadow-sm">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{field.name}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{t(field.type)}</p>
                          </div>
                        </div>
                        <button onClick={() => removeField(field.key)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className={`mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <button onClick={handleUpdateConfig} className="btn-primary flex items-center gap-2 px-8">
                    <Save size={20} />
                    {t('saveConfig')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entries' && (
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRTL ? 'text-right' : ''}`}>
              {/* Entry Form */}
              <div className="lg:col-span-1">
                <div className="card sticky top-8 dark:bg-slate-800 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{editingEntryId ? 'Edit Entry' : t('newEntry')}</h3>
                  {configFields.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t('pleaseSetupFields')}</p>
                      <button onClick={() => setActiveTab('config')} className="text-primary font-bold text-sm hover:underline">{t('goToSetup')}</button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveEntry} className="space-y-5">
                      {configFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{field.name}</label>
                          {field.type === 'file' ? (
                            <div className="relative group">
                              <input 
                                type="file" 
                                className="hidden" 
                                id={`file-${field.key}`}
                                onChange={(e) => alert('File upload logic will be added next!')} 
                              />
                              <label 
                                htmlFor={`file-${field.key}`}
                                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 transition-all text-[var(--color-txt-main)]"
                              >
                                <FileUp size={20} className="text-slate-400 group-hover:text-primary" />
                                <span className="text-sm font-bold text-slate-500 group-hover:text-primary">{t('chooseFile')}</span>
                              </label>
                            </div>
                          ) : (
                            <input 
                              type={field.type} 
                              value={entryForm[field.key] || ''}
                              onChange={(e) => setEntryForm({...entryForm, [field.key]: e.target.value})}
                              placeholder={`${language === 'en' ? 'Enter' : 'درج کریں/ڪريو'} ${field.name.toLowerCase()}`}
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                            />
                          )}
                        </div>
                      ))}
                      <button 
                        type="submit" 
                        disabled={isSavingEntry}
                        className="w-full btn-primary flex items-center justify-center gap-2 py-4 mt-4"
                      >
                        {isSavingEntry ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        {t('addEntry')}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Entry List */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex gap-2 w-full md:w-auto">
                    <select 
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className={`px-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none text-[var(--color-txt-main)]`}
                    >
                      <option value="">{t('searchBy')}</option>
                      {configFields.map(f => (
                        <option key={f.key} value={f.key}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1 w-full">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                    <input 
                      type="text" 
                      placeholder={t('searchEntries')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-[var(--color-txt-main)]`}
                    />
                  </div>
                </div>

                <div className="card overflow-hidden p-0 dark:bg-slate-800 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                      <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                          <th className={`p-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>{t('date')}</th>
                          {configFields.map(field => (
                            <th key={field.key} className={`p-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>{field.name}</th>
                          ))}
                          <th className={`p-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                        {entries.length === 0 ? (
                          <tr>
                            <td colSpan={configFields.length + 1} className="p-12 text-center text-slate-400">
                              {t('noEntriesFound')}
                            </td>
                          </tr>
                        ) : (
                          entries
                            .filter(entry => !searchField || !searchQuery || String(entry[searchField] || '').toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((entry, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors text-[var(--color-txt-main)]">
                              <td className="p-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {new Date(entry.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : (language === 'ur' ? 'ur-PK' : 'sd-PK'))}
                                {entry.createdByName && (
                                  <div className="text-[10px] text-slate-400 mt-1 font-medium">By: {entry.createdByName}</div>
                                )}
                              </td>
                              {configFields.map(field => (
                                <td key={field.key} className="p-4 text-sm font-bold">
                                  {entry[field.key] || '-'}
                                </td>
                              ))}
                              <td className="p-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleEditEntry(entry)}
                                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                                    title="Edit Entry"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  {currentUser?.role !== 'employee' && (
                                    <button 
                                      onClick={() => handleDeleteEntry(entry.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                                      title="Delete Entry"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                  {entry.updatedByName && (
                                    <div className="group relative">
                                      <Clock size={16} className="text-slate-300" />
                                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                                        Last update by: {entry.updatedByName}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
              {/* Business Overview Chart */}
              <div className="card dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Monthly Profit Performance</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of profit trends for the current month.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
                    <Clock size={14} />
                    Current Month
                  </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-1 px-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  {/* Generate 30 bars for the month */}
                  {[...Array(30)].map((_, i) => {
                    const dayProfit = entries
                      .filter(e => {
                        const d = new Date(e.createdAt);
                        return d.getDate() === i + 1 && d.getMonth() === new Date().getMonth();
                      })
                      .reduce((sum, e) => {
                        let rowProfit = 0;
                        configFields.forEach(f => {
                          if (f.accountingType === 'income') rowProfit += Number(e[f.key] || 0);
                          if (f.accountingType === 'expense') rowProfit -= Number(e[f.key] || 0);
                        });
                        return sum + rowProfit;
                      }, 0);
                    
                    const maxProfit = 10000; // Normalized for UI
                    const height = Math.min(Math.abs(dayProfit / maxProfit) * 100, 100);
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div 
                          style={{ height: `${height || 2}%` }}
                          className={`w-full rounded-t-sm transition-all group-hover:opacity-80 ${dayProfit >= 0 ? 'bg-emerald-400 shadow-emerald-400/20' : 'bg-rose-400 shadow-rose-400/20'}`}
                        />
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                          Day {i + 1}: {formatCurrency(dayProfit)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 px-4 text-[10px] text-slate-400 font-bold">
                  <span>Day 1</span>
                  <span>Day 15</span>
                  <span>Day 30</span>
                </div>
              </div>

              <div className="card dark:bg-slate-800 dark:border-slate-700">
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('performanceReports')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('performanceReportsDesc')}</p>
                  </div>
                  <button onClick={exportToCSV} className="btn-primary flex items-center gap-2 px-6">
                    <Download size={20} />
                    {t('exportCSV')}
                  </button>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 ${isRTL ? 'md:flex-row-reverse lg:flex-row-reverse' : ''}`}>
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-1">{t('totalEntries')}</p>
                    <p className="text-3xl font-black text-blue-900 dark:text-blue-300">{entries.length}</p>
                  </div>
                  <div className={`p-6 rounded-2xl border ${profitData?.totalProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20'}`}>
                    <p className={`${profitData?.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} font-bold text-xs uppercase tracking-widest mb-1`}>
                      Total Business Profit
                    </p>
                    <p className={`text-3xl font-black ${profitData?.totalProfit >= 0 ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'}`}>
                      {formatCurrency(profitData?.totalProfit || 0)}
                    </p>
                  </div>
                  <div className={`p-6 rounded-2xl border ${profitData?.userProfit >= 0 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20'}`}>
                    <p className={`${profitData?.userProfit >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'} font-bold text-xs uppercase tracking-widest mb-1`}>
                      Your Share ({profitData?.userPercentage || 100}%)
                    </p>
                    <p className={`text-3xl font-black ${profitData?.userProfit >= 0 ? 'text-amber-900 dark:text-amber-300' : 'text-rose-900 dark:text-rose-300'}`}>
                      {formatCurrency(profitData?.userProfit || 0)}
                    </p>
                  </div>
                  <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/20">
                    <p className="text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest mb-1">{t('lastActivity')}</p>
                    <p className="text-lg font-black text-purple-900 dark:text-purple-300">
                      {entries.length > 0 ? new Date(entries[0].createdAt).toLocaleDateString(language === 'en' ? 'en-US' : (language === 'ur' ? 'ur-PK' : 'sd-PK')) : (language === 'en' ? 'Never' : 'کبھی نہیں')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('reports')}</h4>
                  <div className={`flex flex-col md:flex-row gap-4 items-end ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                    <div className="flex-1 space-y-2">
                      <label className={`text-xs font-bold text-slate-600 dark:text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('startDate')}</label>
                      <input 
                        type="date" 
                        value={dateFilter.start}
                        onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className={`text-xs font-bold text-slate-600 dark:text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('endDate')}</label>
                      <input 
                        type="date" 
                        value={dateFilter.end}
                        onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                      />
                    </div>
                    <button className="btn-secondary px-8 flex items-center gap-2">
                      <Filter size={18} />
                      {t('applyFilter')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'partners' && (
            <div className={`space-y-6 ${isRTL ? 'text-right' : ''}`}>
              <div className="card dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Partners & Ownership</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Manage partners and their ownership percentages for this business.</p>
                
                <div className="space-y-4">
                  {profitData?.partners && profitData.partners.length > 0 ? (
                    profitData.partners.map((partner: any, idx: number) => (
                      <div key={idx} className={`flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Users size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{partner.name}</p>
                            <p className="text-sm text-slate-500">{partner.role || 'Partner'}</p>
                            {partner.investment > 0 && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                                Investment: {formatCurrency(partner.investment)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-primary">{partner.percentage}%</p>
                          <p className="text-xs text-slate-500 uppercase tracking-widest">Ownership</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                      <Users size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">No partners added yet</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl border border-primary/20">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Total Ownership</p>
                      <p className="text-4xl font-black text-primary">{profitData?.partners?.reduce((sum: number, p: any) => sum + p.percentage, 0) || 0}%</p>
                    </div>
                    <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Your Profit Share</p>
                      <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(profitData?.userProfit || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDetailsPage;
