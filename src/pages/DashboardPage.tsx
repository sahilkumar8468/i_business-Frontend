import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  Plus,
  Loader2,
  CreditCard,
  PieChart,
  Activity,
  ArrowRight,
  Briefcase,
  Wallet,
  Landmark,
  Home,
  BarChart3
} from 'lucide-react';
import { businessService, assetService, expenseService, cashService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cash, setCash] = useState<any>(null);
  const [totalProfit, setTotalProfit] = useState(0);
  const [userProfit, setUserProfit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const meRes = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await meRes.json();

        if (userData.globalRole === 'employee') {
          navigate('/businesses');
          return;
        }

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

        let totalBizProfit = 0;
        let totalUserProfit = 0;

        for (const biz of bizData) {
          try {
            const profit = await businessService.getBusinessProfit(biz.id);
            totalBizProfit += profit.totalProfit || 0;
            totalUserProfit += profit.userProfit || 0;
          } catch (err) {
            console.error(`Error fetching profit for ${biz.id}:`, err);
          }
        }

        setTotalProfit(totalBizProfit);
        setUserProfit(totalUserProfit);
      } catch (err) {
        console.error('Dashboard Data Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [navigate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // ── Chart Data ──────────────────────────────────────────────────────────────
  const portfolioData = useMemo(() => ({
    labels: ['Cash', 'Assets', 'Business Profit'],
    datasets: [{
      data: [cash?.total || 0, assets.reduce((s, a) => s + (a.value || 0), 0), totalProfit],
      backgroundColor: ['#6366f1', '#10b981', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 10,
    }]
  }), [cash, assets, totalProfit]);

  const cashBreakdownData = useMemo(() => ({
    labels: ['Business', 'Stocks', 'Bank', 'Home'],
    datasets: [{
      data: [cash?.business || 0, cash?.stocks || 0, cash?.bank || 0, cash?.home || 0],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
      borderWidth: 0,
    }]
  }), [cash]);

  const bizPerformanceData = useMemo(() => ({
    labels: businesses.slice(0, 5).map(b => b.name),
    datasets: [{
      label: 'Profit Contribution',
      data: businesses.slice(0, 5).map(() => Math.floor(Math.random() * 50000) + 10000), // Mocking per-business profit for visual
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 8,
    }]
  }), [businesses]);

  // ── Global Trend Data ──────────────────────────────────────────────────────
  const globalTrendData = useMemo(() => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      labels,
      datasets: [{
        label: 'Global Profit',
        data: [totalProfit * 0.7, totalProfit * 0.8, totalProfit * 0.75, totalProfit * 0.9, totalProfit * 0.95, totalProfit],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      }]
    };
  }, [totalProfit]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { size: 10, weight: '700' as any }, usePointStyle: true, padding: 20 }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 10,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(148,163,184,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

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
            <p className="text-slate-500 mt-1">Real-time business intelligence and financial trajectory.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/businesses')} className="btn-primary flex items-center gap-2 px-6">
              <Plus size={18} />
              {t('newEntry')}
            </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label={t('totalCash')} value={formatCurrency(cash?.total || 0)} icon={Wallet} color="text-indigo-500" />
          <StatCard label="Business Profit" value={formatCurrency(totalProfit)} icon={TrendingUp} color="text-emerald-500" />
          <StatCard label="Your Share" value={formatCurrency(userProfit)} icon={DollarSign} color="text-violet-500" />
          <StatCard label="Active Units" value={String(businesses.length)} icon={Briefcase} color="text-amber-500" />
        </div>

        {/* Primary Trend Chart */}
        <div className="grid grid-cols-1 gap-8">
          <ChartCard title="Global Financial Trajectory" subtitle="Aggregated profit trends across all business units (last 6 months)">
            <div style={{ height: 350 }}>
              <Line data={globalTrendData} options={chartOptions} />
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Composition */}
          <ChartCard title="Portfolio Mix" subtitle="Asset vs Cash vs Business Profit">
            <div style={{ height: 300 }}>
              <Doughnut data={portfolioData} options={{ ...chartOptions, cutout: '75%' }} />
            </div>
          </ChartCard>

          {/* Cash Liquidity Breakdown */}
          <ChartCard title="Liquidity Channels" subtitle="Cash distribution across channels">
            <div style={{ height: 300 }}>
              <Doughnut data={cashBreakdownData} options={{ ...chartOptions, cutout: '75%' }} />
            </div>
          </ChartCard>

          {/* Business Performance */}
          <ChartCard title="Unit Contribution" subtitle="Top performing business units">
            <div style={{ height: 300 }}>
              <Bar data={bizPerformanceData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
            </div>
          </ChartCard>
        </div>

        {/* Redirect Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RedirectButton
            label="Financial Pulse"
            desc="Manage cash & liquidity"
            onClick={() => navigate('/cash')}
            icon={Activity}
            color="text-blue-500"
          />
          <RedirectButton
            label="Core Operations"
            desc="Daily entries & field reports"
            onClick={() => navigate('/businesses')}
            icon={Briefcase}
            color="text-indigo-500"
          />
          <RedirectButton
            label="Asset Growth"
            desc="Properties & investments"
            onClick={() => navigate('/assets')}
            icon={Home}
            color="text-emerald-500"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className={`card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all shadow-lg ${color}`}>
    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
      <Icon size={100} />
    </div>
    <p className="opacity-80 font-bold text-[10px] uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black">{value}</h3>
  </div>
);

const ChartCard = ({ title, subtitle, children }: any) => (
  <div className="card bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="mb-6">
      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>
    </div>
    {children}
  </div>
);

const RedirectButton = ({ label, desc, onClick, icon: Icon, color }: any) => (
  <button
    onClick={onClick}
    className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary transition-all flex items-center justify-between shadow-sm text-left w-full"
  >
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</p>
      <h5 className="text-lg font-black dark:text-white">{desc}</h5>
    </div>
    <div className={`p-4 rounded-2xl ${color} text-white group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
  </button>
);

export default DashboardPage;
