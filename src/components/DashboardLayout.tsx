import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X, 
  LogOut,
  BarChart3,
  CreditCard,
  Gem,
  ShoppingCart
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Languages, Globe } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: t('overview'), path: '/dashboard' },
    { icon: <CreditCard size={20} />, label: t('cashManagement'), path: '/cash' },
    { icon: <BarChart3 size={20} />, label: t('businesses'), path: '/businesses' },
    { icon: <Gem size={20} />, label: t('assets'), path: '/assets' },
    { icon: <ShoppingCart size={20} />, label: t('expenses'), path: '/expenses' },
    { icon: <Settings size={20} />, label: t('settings'), path: '#' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">i</span>
            </div>
            <span className="text-xl font-bold text-slate-900">i business</span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 font-medium group"
              >
                <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all duration-200 font-medium group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              {t('signOut')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-[var(--color-surface)] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-72 group focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white dark:focus-within:bg-slate-700 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder={t('search')} 
                className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm text-[var(--color-txt-main)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Language Toggle */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <Globe size={20} />
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => setLanguage('en')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-t-xl font-medium">English</button>
                <button onClick={() => setLanguage('ur')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 font-medium">اردو (Urdu)</button>
                <button onClick={() => setLanguage('sd')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-b-xl font-medium">سنڌي (Sindhi)</button>
              </div>
            </div>

            <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>
            
            <div className="h-10 w-[1px] bg-slate-200 hidden sm:block" />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Alex Johnson</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-indigo-400 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
                AJ
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
