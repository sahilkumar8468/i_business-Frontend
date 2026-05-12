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
  FileUp
} from 'lucide-react';
import { businessService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const BusinessDetailsPage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entries' | 'config' | 'reports'>('entries');
  
  // Field Config State
  const [configFields, setConfigFields] = useState<any[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  
  // Entry Form State
  const [entryForm, setEntryForm] = useState<any>({});
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  
  // Filter/Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
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
      
      const entriesData = await businessService.getBusinessEntries(businessId!, {});
      setEntries(entriesData);
    } catch (err) {
      console.error(err);
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

  const calculateProfit = () => {
    let totalIncome = 0;
    let totalExpense = 0;

    entries.forEach(entry => {
      configFields.forEach(field => {
        const val = Number(entry[field.key]) || 0;
        if (field.accountingType === 'income') totalIncome += val;
        if (field.accountingType === 'expense') totalExpense += val;
      });
    });

    return totalIncome - totalExpense;
  };

  const removeField = (key: string) => {
    setConfigFields(configFields.filter(f => f.key !== key));
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingEntry(true);
      await businessService.addBusinessEntry(businessId!, entryForm);
      setEntryForm({});
      alert(language === 'en' ? 'Entry added successfully!' : (language === 'ur' ? 'اندراج کامیابی سے شامل ہو گیا!' : 'اندراج ڪاميابي سان شامل ٿي ويو!'));
      fetchBusinessData();
    } catch (err) {
      alert(language === 'en' ? 'Failed to add entry' : (language === 'ur' ? 'اندراج شامل کرنے میں ناکام' : 'اندراج شامل ڪرڻ ۾ ناڪام'));
    } finally {
      setIsSavingEntry(false);
    }
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
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Settings size={18} />
              {t('setupFields')}
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <BarChart size={18} />
              {t('reports')}
            </button>
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('newEntry')}</h3>
                  {configFields.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t('pleaseSetupFields')}</p>
                      <button onClick={() => setActiveTab('config')} className="text-primary font-bold text-sm hover:underline">{t('goToSetup')}</button>
                    </div>
                  ) : (
                    <form onSubmit={handleAddEntry} className="space-y-5">
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
                              </td>
                              {configFields.map(field => (
                                <td key={field.key} className="p-4 text-sm font-bold">
                                  {entry[field.key] || '-'}
                                </td>
                              ))}
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
                  <div className={`p-6 rounded-2xl border ${calculateProfit() >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20'}`}>
                    <p className={`${calculateProfit() >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} font-bold text-xs uppercase tracking-widest mb-1`}>
                      {t('netProfit')}
                    </p>
                    <p className={`text-3xl font-black ${calculateProfit() >= 0 ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'}`}>
                      {formatCurrency(calculateProfit())}
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDetailsPage;
