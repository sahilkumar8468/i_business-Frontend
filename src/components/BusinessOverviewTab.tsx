import React, { useEffect, useRef, useMemo } from 'react';
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
  Title,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart2, PieChart, ArrowUpRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  Title
);

interface Field {
  key: string;
  name: string;
  type: string;
  accountingType: 'income' | 'expense' | 'neutral';
}

interface Entry {
  id: string;
  createdAt: string;
  [key: string]: any;
}

interface Partner {
  name: string;
  percentage: number;
  role?: string;
}

interface ProfitData {
  totalProfit: number;
  userProfit: number;
  userPercentage: number;
  partners?: Partner[];
}

interface Props {
  entries: Entry[];
  configFields: Field[];
  profitData: ProfitData | null;
  formatCurrency: (amount: number) => string;
}

const CHART_COLORS = {
  income: 'rgba(16, 185, 129, 1)',
  incomeBg: 'rgba(16, 185, 129, 0.15)',
  expense: 'rgba(239, 68, 68, 1)',
  expenseBg: 'rgba(239, 68, 68, 0.15)',
  profit: 'rgba(99, 102, 241, 1)',
  profitBg: 'rgba(99, 102, 241, 0.15)',
  palette: [
    'rgba(99,102,241,0.85)',
    'rgba(16,185,129,0.85)',
    'rgba(245,158,11,0.85)',
    'rgba(239,68,68,0.85)',
    'rgba(139,92,246,0.85)',
    'rgba(20,184,166,0.85)',
  ],
};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.92)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      padding: 12,
      cornerRadius: 10,
      borderColor: 'rgba(99,102,241,0.3)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 11, weight: '600' as any } },
    },
    y: {
      grid: { color: 'rgba(148,163,184,0.08)' },
      ticks: { color: '#94a3b8', font: { size: 11 } },
    },
  },
};

const BusinessOverviewTab: React.FC<Props> = ({ entries, configFields, profitData, formatCurrency }) => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const incomeFields = configFields.filter(f => f.accountingType === 'income');
  const expenseFields = configFields.filter(f => f.accountingType === 'expense');

  const totalIncome = useMemo(() =>
    entries.reduce((sum, e) => {
      incomeFields.forEach(f => { sum += Number(e[f.key] || 0); });
      return sum;
    }, 0), [entries, incomeFields]);

  const totalExpense = useMemo(() =>
    entries.reduce((sum, e) => {
      expenseFields.forEach(f => { sum += Number(e[f.key] || 0); });
      return sum;
    }, 0), [entries, expenseFields]);

  const netProfit = profitData?.totalProfit ?? (totalIncome - totalExpense);
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // ── Monthly bar data (last 6 months) ─────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const months: { label: string; income: number; expense: number; profit: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const monthEntries = entries.filter(e => {
        const ed = new Date(e.createdAt);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      });
      const income = monthEntries.reduce((s, e) => {
        incomeFields.forEach(f => { s += Number(e[f.key] || 0); });
        return s;
      }, 0);
      const expense = monthEntries.reduce((s, e) => {
        expenseFields.forEach(f => { s += Number(e[f.key] || 0); });
        return s;
      }, 0);
      months.push({ label, income, expense, profit: income - expense });
    }
    return months;
  }, [entries, incomeFields, expenseFields]);

  // ── Daily profit line (current month) ────────────────────────────────────────
  const dailyData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const days: number[] = Array(daysInMonth).fill(0);
    entries.forEach(e => {
      const d = new Date(e.createdAt);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        let p = 0;
        incomeFields.forEach(f => { p += Number(e[f.key] || 0); });
        expenseFields.forEach(f => { p -= Number(e[f.key] || 0); });
        days[d.getDate() - 1] += p;
      }
    });
    return days;
  }, [entries, incomeFields, expenseFields]);

  // ── Field breakdown ────────────────────────────────────
  const fieldBreakdown = useMemo(() => {
    return incomeFields.map(f => ({
      name: f.name,
      total: entries.reduce((s, e) => s + Number(e[f.key] || 0), 0),
    })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);
  }, [entries, incomeFields]);

  const expenseBreakdown = useMemo(() => {
    return expenseFields.map(f => ({
      name: f.name,
      total: entries.reduce((s, e) => s + Number(e[f.key] || 0), 0),
    })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);
  }, [entries, expenseFields]);

  const partners = profitData?.partners ?? [];
  const noData = entries.length === 0;

  // ── Chart datasets ────────────────────────────────────────────────────────────
  const combinedTrendData = {
    labels: monthlyData.map(m => m.label),
    datasets: [
      {
        type: 'line' as const,
        label: 'Net Profit',
        data: monthlyData.map(m => m.profit),
        borderColor: CHART_COLORS.profit,
        borderWidth: 3,
        pointRadius: 4,
        fill: false,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Income',
        data: monthlyData.map(m => m.income),
        backgroundColor: CHART_COLORS.incomeBg,
        hoverBackgroundColor: CHART_COLORS.income,
        borderRadius: 6,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Expense',
        data: monthlyData.map(m => m.expense),
        backgroundColor: CHART_COLORS.expenseBg,
        hoverBackgroundColor: CHART_COLORS.expense,
        borderRadius: 6,
        yAxisID: 'y',
      }
    ],
  };

  const contributionData = {
    labels: fieldBreakdown.slice(0, 5).map(f => f.name),
    datasets: [{
      label: 'Contribution',
      data: fieldBreakdown.slice(0, 5).map(f => f.total),
      backgroundColor: CHART_COLORS.palette,
      borderRadius: 10,
      barThickness: 20,
    }],
  };

  const lineOptions = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
    },
    scales: {
      x: { ...chartDefaults.scales.x, ticks: { ...chartDefaults.scales.x.ticks, maxTicksLimit: 10 } },
      y: chartDefaults.scales.y,
    },
  };

  const mixedChartOptions = {
    ...chartDefaults,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(148,163,184,0.05)' }, ticks: { color: '#94a3b8' } },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { size: 10, weight: '700' as any }, usePointStyle: true, padding: 20 }
      },
      tooltip: { ...chartDefaults.plugins.tooltip }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { size: 10, weight: '600' as any }, padding: 15, boxWidth: 8, usePointStyle: true }
      },
      tooltip: { ...chartDefaults.plugins.tooltip }
    },
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    ...chartDefaults,
    scales: {
      x: { grid: { display: false }, ticks: { display: false } },
      y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10, weight: '700' as any } } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { ...chartDefaults.plugins.tooltip }
    }
  };

  // ── UI Components ─────────────────────────────────────────────────────────────
  const KpiCard = ({ label, value, icon: Icon, color, trend }: { label: string; value: string; icon: any; color: string; trend?: string }) => (
    <div className="group relative overflow-hidden rounded-3xl p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-500 ${color}`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
            <Icon size={24} />
          </div>
          {trend && (
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h4>
      </div>
    </div>
  );

  const ChartCard = ({ title, subtitle, children, fullWidth }: { title: string; subtitle?: string; children: React.ReactNode; fullWidth?: boolean }) => (
    <div className={`rounded-3xl p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${fullWidth ? 'xl:col-span-3' : ''}`}>
      <div className="mb-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 font-medium mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard label="Revenue" value={formatCurrency(totalIncome)} icon={TrendingUp} color="text-emerald-500" trend="+12.5%" />
        <KpiCard label="Expenses" value={formatCurrency(totalExpense)} icon={TrendingDown} color="text-rose-500" trend="-4.2%" />
        <KpiCard label="Net Profit" value={formatCurrency(netProfit)} icon={DollarSign} color="text-indigo-500" trend={`${profitMargin}% Margin`} />
        <KpiCard label="Transactions" value={String(entries.length)} icon={Activity} color="text-amber-500" trend="All time" />
      </div>

      {/* ── Primary Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <ChartCard title="Performance Analytics" subtitle="Monthly income, expense, and profit trajectory" fullWidth>
          <div style={{ height: 350 }}>
            {noData ? <div className="h-full flex items-center justify-center text-slate-300">No data available</div> : <Bar data={combinedTrendData} options={mixedChartOptions} />}
          </div>
        </ChartCard>

        <ChartCard title="Daily Pulse" subtitle="Real-time profit fluctuations this month" fullWidth={false} className="xl:col-span-2">
           <div style={{ height: 350 }}>
            {noData ? <div className="h-full flex items-center justify-center text-slate-300">No data available</div> : <Line data={dailyLineData} options={lineOptions} />}
          </div>
        </ChartCard>
      </div>

      {/* ── Secondary Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Income Sources" subtitle="Revenue distribution by field">
          <div style={{ height: 280 }}>
            {fieldBreakdown.length === 0 ? <div className="h-full flex items-center justify-center text-slate-300">No income data</div> : <Doughnut data={{
              labels: fieldBreakdown.map(f => f.name),
              datasets: [{ data: fieldBreakdown.map(f => f.total), backgroundColor: CHART_COLORS.palette, borderWidth: 0, hoverOffset: 15 }]
            }} options={doughnutOptions} />}
          </div>
        </ChartCard>

        <ChartCard title="Expense Hotspots" subtitle="Where the money is going">
          <div style={{ height: 280 }}>
            {expenseBreakdown.length === 0 ? <div className="h-full flex items-center justify-center text-slate-300">No expense data</div> : <Doughnut data={{
              labels: expenseBreakdown.map(f => f.name),
              datasets: [{ data: expenseBreakdown.map(f => f.total), backgroundColor: ['#f43f5e', '#fb923c', '#facc15', '#fb7185'], borderWidth: 0, hoverOffset: 15 }]
            }} options={doughnutOptions} />}
          </div>
        </ChartCard>

        <ChartCard title="Top Earners" subtitle="Highest contributing income fields">
           <div style={{ height: 280 }}>
            {fieldBreakdown.length === 0 ? <div className="h-full flex items-center justify-center text-slate-300">No data</div> : <Bar data={contributionData} options={horizontalBarOptions} />}
          </div>
        </ChartCard>
      </div>

      {/* ── Ownership & Volume ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Equity Structure" subtitle="Partner ownership distribution">
           <div style={{ height: 250 }}>
            {partners.length === 0 ? <div className="h-full flex items-center justify-center text-slate-300">No partners</div> : <Doughnut data={{
              labels: partners.map(p => p.name),
              datasets: [{ data: partners.map(p => p.percentage), backgroundColor: CHART_COLORS.palette, borderWidth: 0 }]
            }} options={{ ...doughnutOptions, cutout: '80%' }} />}
          </div>
        </ChartCard>

        <ChartCard title="Operational Volume" subtitle="Record frequency over time">
          <div style={{ height: 250 }}>
            {noData ? <div className="h-full flex items-center justify-center text-slate-300">No records</div> : <Bar data={{
              labels: monthlyData.map(m => m.label),
              datasets: [{ label: 'Entries', data: monthlyData.map(m => entries.filter(e => {
                const ed = new Date(e.createdAt);
                const target = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - monthlyData.indexOf(m)), 1);
                return ed.getFullYear() === target.getFullYear() && ed.getMonth() === target.getMonth();
              }).length), backgroundColor: 'rgba(99,102,241,0.5)', borderRadius: 10 }]
            }} options={{ ...chartDefaults, plugins: { legend: { display: false } } }} />}
          </div>
        </ChartCard>
      </div>

      {/* ── Redirect Actions ── */}
      <div className="flex flex-wrap gap-4 pt-4">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('overview-navigate', { detail: 'entries' }))}
          className="flex-1 min-w-[200px] group p-6 rounded-3xl bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-between shadow-lg"
        >
          <div className="text-left">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Take Action</p>
            <h5 className="text-lg font-black">Manage Entries</h5>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary transition-colors">
            <ArrowUpRight size={20} />
          </div>
        </button>

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('overview-navigate', { detail: 'config' }))}
          className="flex-1 min-w-[200px] group p-6 rounded-3xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-primary transition-all flex items-center justify-between shadow-sm"
        >
          <div className="text-left">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Configuration</p>
            <h5 className="text-lg font-black dark:text-white">Business Settings</h5>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
            <Settings size={20} />
          </div>
        </button>

        <button 
          onClick={() => navigate('/assets')}
          className="flex-1 min-w-[200px] group p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white hover:opacity-90 transition-all flex items-center justify-between shadow-lg"
        >
          <div className="text-left">
            <p className="text-xs font-bold text-white/60 uppercase mb-1">Global Portfolio</p>
            <h5 className="text-lg font-black">Property & Assets</h5>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl">
            <Gem size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default BusinessOverviewTab;
