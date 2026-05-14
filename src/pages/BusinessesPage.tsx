import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ShoppingBag, Plus, Loader2, Search, Filter, MoreVertical, Trash2, Users,Edit } from 'lucide-react';
import { businessService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const BusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newBizName, setNewBizName] = useState('');
  const [newBizStartDate, setNewBizStartDate] = useState('');
  const [newBizEndDate, setNewBizEndDate] = useState('');
  const [partners, setPartners] = useState<any[]>([{ userId: 'current', name: 'You', percentage: 100, role: 'owner', investment: 0 }]);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPercentage, setNewPartnerPercentage] = useState(0);
  const [newPartnerInvestment, setNewPartnerInvestment] = useState('');
  const [newPartnerRole, setNewPartnerRole] = useState('partner');
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [isModalOpen,setIsModalOpen] = useState(false);
  const [isJoinModalOpen,setIsJoinModalOpen] = useState(false);
  const [joinBusinessId,setJoinBusinessId] = useState('');
  
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
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setCurrentUser(await res.json());
      } catch (err) {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
    fetchBusinesses();
  }, []);

  const handleSaveBusiness = async () => {
    if (!newBizName) return;
    
    const totalPercentage = partners.reduce((sum, p) => sum + Number(p.percentage || 0), 0);
    if (!editingBusinessId && totalPercentage !== 100) {
      toast.error(`Total ownership percentage must equal 100%. Currently at ${totalPercentage}%`);
      return;
    }
    
    try {
      if (editingBusinessId) {
        await businessService.updateBusiness(editingBusinessId, {
          name: newBizName,
          startDate: newBizStartDate || null,
          endDate: newBizEndDate || null
        });
        toast.success('Business updated successfully!');
      } else {
        await businessService.createBusiness({
          name: newBizName,
          startDate: newBizStartDate || null,
          endDate: newBizEndDate || null,
          config: {},
          partners
        });
        toast.success('Business created successfully!');
      }
      
      setNewBizName('');
      setNewBizStartDate('');
      setNewBizEndDate('');
      setPartners([{ userId: 'current', name: 'You', percentage: 100, role: 'owner', investment: 0 }]);
      setEditingBusinessId(null);
      setIsModalOpen(false);
      fetchBusinesses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save business');
    }
  };

  const openEditModal = (e: React.MouseEvent, biz: any) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setEditingBusinessId(biz.id);
    setNewBizName(biz.name);
    setNewBizStartDate(biz.startDate ? new Date(biz.startDate).toISOString().split('T')[0] : '');
    setNewBizEndDate(biz.endDate ? new Date(biz.endDate).toISOString().split('T')[0] : '');
    // partners are handled differently for existing businesses usually, 
    // but we can prefill them for UI consistency
    setPartners(biz.partners || []);
    setIsModalOpen(true);
  };

  const handleJoinBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinBusinessId) return;

    try {
      setIsJoining(true);
      await businessService.joinBusiness(joinBusinessId);
      toast.success('Successfully joined the business! Data is now synced.');
      setIsJoinModalOpen(false);
      setJoinBusinessId('');
      fetchBusinesses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to join business. Please check the ID.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteBusiness = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Don't navigate to details
    setOpenMenuId(null);
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      await businessService.deleteBusiness(id);
      toast.success('Business deleted successfully');
      fetchBusinesses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete business');
    }
  };

  const addPartner = () => {
    if (!newPartnerName || newPartnerPercentage <= 0) return;
    
    const currentTotal = partners.reduce((sum, p) => sum + Number(p.percentage || 0), 0);
    if (currentTotal + Number(newPartnerPercentage || 0) > 100) {
      toast.error('Total percentage cannot exceed 100%');
      return;
    }
    
    // Add partner without auto-adjusting - user must manually adjust percentages
    setPartners([
      ...partners,
      { 
        userId: Date.now().toString(), 
        name: newPartnerName, 
        percentage: newPartnerPercentage, 
        role: newPartnerRole,
        investment: newPartnerInvestment ? Number(newPartnerInvestment) : 0
      }
    ]);
    setNewPartnerName('');
    setNewPartnerPercentage(0);
    setNewPartnerInvestment('');
    setNewPartnerRole('partner');
  };

  const removePartner = (userId: string) => {
    // Simply remove the partner - user must manually redistribute percentage
    setPartners(partners.filter(p => p.userId !== userId));
  };

  const updatePartnerPercentage = (userId: string, newPercentage: number) => {
    // Allow any percentage during editing, validation happens on submit
    setPartners(partners.map(p => 
      p.userId === userId ? { ...p, percentage: newPercentage } : p
    ));
  };

  const updatePartnerRole = (userId: string, newRole: string) => {
    setPartners(partners.map(p => 
      p.userId === userId ? { ...p, role: newRole } : p
    ));
  };

  const updatePartnerInvestment = (userId: string, newInvestment: number) => {
    setPartners(partners.map(p => 
      p.userId === userId ? { ...p, investment: newInvestment } : p
    ));
  };

  return (
    <DashboardLayout>
      <div className={`space-y-8 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('businesses')}</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and monitor your business ventures.</p>
          </div>
          {currentUser?.globalRole !== 'employee' && (
            <div className="flex gap-3">
              <button 
                onClick={() => setIsJoinModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <Users size={20} />
                Join Business
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center gap-2 px-6"
              >
                <Plus size={20} />
                {t('addBusiness')}
              </button>
            </div>
          )}
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
              {currentUser?.globalRole !== 'employee' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary px-8"
                >
                  {t('addBusiness')}
                </button>
              )}
            </div>
          ) : (
            businesses.map((biz) => (
              <div 
                key={biz.id} 
                onClick={() => navigate(`/businesses/${biz.id}`)}
                className="card hover:shadow-xl hover:shadow-primary/5 hover:border-primary transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-4 flex gap-1`}>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === biz.id ? null : biz.id);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {currentUser?.globalRole !== 'employee' && openMenuId === biz.id && (
                      <div className={`absolute top-full mt-1 ${isRTL ? 'left-0' : 'right-0'} w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 py-1 overflow-hidden`}>
                        <button 
                          onClick={(e) => openEditModal(e, biz)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Edit size={16} />
                          Edit Details
                        </button>
                        <button 
                          onClick={(e) => handleDeleteBusiness(e, biz.id, biz.name)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete Business
                        </button>
                      </div>
                    )}
                  </div>
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
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('addBusiness')}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Enter the details of your new business venture and ownership structure.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveBusiness(); }} className="space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      value={newBizStartDate}
                      onChange={(e) => setNewBizStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-600 dark:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">End Date (optional)</label>
                    <input 
                      type="date" 
                      value={newBizEndDate}
                      onChange={(e) => setNewBizEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-600 dark:text-slate-400"
                    />
                  </div>
                </div>

                {/* Partner Management */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Ownership & Roles</label>
                  <div className="space-y-3 mb-4">
                    {partners.map((partner) => (
                      <div key={partner.userId} className={`flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-1">
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <p className="font-bold text-slate-900 dark:text-white">{partner.name}</p>
                            <select
                              value={partner.role}
                              onChange={(e) => updatePartnerRole(partner.userId, e.target.value)}
                              className="text-xs px-2 py-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded font-bold text-slate-600 dark:text-slate-400"
                            >
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                              <option value="partner">Partner</option>
                              <option value="employee">Employee</option>
                            </select>
                          </div>
                          <div className={`flex items-center gap-2 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <input
                              type="number"
                              value={partner.percentage}
                              onChange={(e) => updatePartnerPercentage(partner.userId, Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-sm font-bold text-center"
                              min="0"
                              max="100"
                              title="Percentage"
                            />
                            <span className="text-sm text-slate-500">%</span>
                            
                            <input
                              type="number"
                              value={partner.investment || ''}
                              onChange={(e) => updatePartnerInvestment(partner.userId, Number(e.target.value))}
                              className="w-24 ml-2 px-2 py-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-sm font-bold text-center"
                              placeholder="Investment"
                              min="0"
                              title="Investment"
                            />
                            <span className="text-sm text-slate-500">PKR</span>
                          </div>
                        </div>
                        {partner.userId !== 'current' && (
                          <button
                            type="button"
                            onClick={() => removePartner(partner.userId)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className={`flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="text"
                      value={newPartnerName}
                      onChange={(e) => setNewPartnerName(e.target.value)}
                      placeholder="Name"
                      className="flex-1 min-w-[120px] px-4 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                    />
                    <select
                      value={newPartnerRole}
                      onChange={(e) => setNewPartnerRole(e.target.value)}
                      className="w-28 px-2 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-medium text-sm text-[var(--color-txt-main)]"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="partner">Partner</option>
                      <option value="employee">Employee</option>
                    </select>
                    <input
                      type="number"
                      value={newPartnerPercentage}
                      onChange={(e) => setNewPartnerPercentage(Number(e.target.value))}
                      placeholder="%"
                      min="0"
                      max="100"
                      className="w-16 px-2 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)] text-center"
                    />
                    <input
                      type="number"
                      value={newPartnerInvestment}
                      onChange={(e) => setNewPartnerInvestment(e.target.value)}
                      placeholder="Investment"
                      className="w-28 px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-medium text-[var(--color-txt-main)]"
                    />
                    <button
                      type="button"
                      onClick={addPartner}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center justify-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <p className={`text-xs mt-2 ${partners.reduce((sum, p) => sum + p.percentage, 0) === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    Total: {partners.reduce((sum, p) => sum + p.percentage, 0)}% {partners.reduce((sum, p) => sum + p.percentage, 0) === 100 ? '✓' : '(must equal 100%)'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    You can set roles, manage ownership percentages, and track investments for each member.
                  </p>
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

      {/* Join Business Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Join Existing Business</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Enter the Business ID to sync data with your partner.</p>
              
              <form onSubmit={handleJoinBusiness} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Identifier (ID)</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={joinBusinessId}
                    onChange={(e) => setJoinBusinessId(e.target.value)}
                    placeholder="Enter Business ID"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                    required
                  />
                </div>

                <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button 
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isJoining}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center"
                  >
                    {isJoining ? <Loader2 size={20} className="animate-spin" /> : 'Join & Sync'}
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
