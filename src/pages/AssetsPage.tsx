import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Home, Plus, Loader2, Trash2, Building2, Car, Coins, Gem, ArrowLeft } from 'lucide-react';
import { assetService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'property',
    value: '',
    description: ''
  });
  const navigate = useNavigate();
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const data = await assetService.getAssets();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assetService.addAsset(formData);
      setIsModalOpen(false);
      setFormData({ name: '', type: 'property', value: '', description: '' });
      fetchAssets();
    } catch (err) {
      alert('Failed to add asset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await assetService.deleteAsset(id);
      fetchAssets();
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalAssetsValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'property': return <Building2 size={24} />;
      case 'vehicle': return <Car size={24} />;
      case 'gold': return <Coins size={24} />;
      default: return <Gem size={24} />;
    }
  };

  return (
    <DashboardLayout>
      <div className={`space-y-8 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 md:hidden">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('assets')}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Track your properties, vehicles, and long-term investments.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Plus size={20} />
            {t('addAsset')}
          </button>
        </div>

        {/* Assets Summary Card */}
        <div className="card bg-slate-900 text-white p-8 overflow-hidden relative group">
          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-8 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
            <Gem size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-medium uppercase tracking-widest text-sm mb-2">{t('totalAssets')}</p>
            <h2 className="text-5xl font-black tracking-tight">{formatCurrency(totalAssetsValue)}</h2>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : assets.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <p className="text-slate-500">No assets found. Add one to get started!</p>
            </div>
          ) : (
            assets.map((asset) => (
              <div key={asset.id} className="card group hover:border-primary transition-all relative overflow-hidden">
                <div className={`flex justify-between items-start mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    asset.type === 'property' ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' :
                    asset.type === 'vehicle' ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400' :
                    asset.type === 'gold' ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400' :
                    'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {getAssetIcon(asset.type)}
                  </div>
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{asset.name}</h3>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{formatCurrency(asset.value)}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{asset.description || 'No description'}</p>
                
                <div className={`mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                   <span>{t('fieldType')}: {t(asset.type)}</span>
                   <span>Added: {new Date(asset.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('addAsset')}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Enter the details of your property or investment.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{language === 'en' ? 'Asset Name' : (language === 'ur' ? 'اثاثہ کا نام' : 'اثاثي جو نالو')}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. DHA Plot 42, Corolla 2024"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                  />
                </div>

                <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                   <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('fieldType')}</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                    >
                      <option value="property">{t('property')}</option>
                      <option value="vehicle">{t('vehicle')}</option>
                      <option value="gold">{t('gold')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('amount')} (PKR)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      placeholder="Amount"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t('notes')}</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Any additional details..."
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

export default AssetsPage;
