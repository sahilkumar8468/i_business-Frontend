import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Plus,
  Loader2
} from 'lucide-react';
import { businessService } from '../services/api';

const DashboardPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const data = await businessService.getBusinesses();
        setBusinesses(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch businesses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const recentTransactions = [
    { id: '#TRX-9482', user: 'Sarah Connor', date: 'Oct 24, 2023', amount: '$1,200.00', status: 'Completed' },
    { id: '#TRX-9481', user: 'James Bond', date: 'Oct 23, 2023', amount: '$850.00', status: 'Pending' },
    { id: '#TRX-9480', user: 'Ellen Ripley', date: 'Oct 23, 2023', amount: '$2,100.00', status: 'Completed' },
    { id: '#TRX-9479', user: 'Luke Skywalker', date: 'Oct 22, 2023', amount: '$430.00', status: 'Refunded' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500 mt-1">Welcome back, Alex. Here's what's happening today.</p>
          </div>
          <button 
            onClick={async () => {
              const name = prompt('Enter Business Name:');
              if (name) {
                try {
                  await businessService.createBusiness({ name });
                  window.location.reload();
                } catch (err: any) {
                  alert(err.response?.data?.error || 'Failed to create business');
                }
              }
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Business
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Business List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : businesses.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <p className="text-slate-500">No businesses found. Create one to get started!</p>
            </div>
          ) : (
            businesses.map((biz) => (
              <div key={biz.id} className="card hover:border-primary transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <ShoppingBag size={24} />
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">Active</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{biz.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Created: {new Date(biz.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>

        {/* Transactions Table */}
        <div className="card overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
            <button className="text-primary font-semibold text-sm hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-semibold text-slate-400 text-sm uppercase tracking-wider">Transaction ID</th>
                  <th className="pb-4 font-semibold text-slate-400 text-sm uppercase tracking-wider">Customer</th>
                  <th className="pb-4 font-semibold text-slate-400 text-sm uppercase tracking-wider">Date</th>
                  <th className="pb-4 font-semibold text-slate-400 text-sm uppercase tracking-wider">Amount</th>
                  <th className="pb-4 font-semibold text-slate-400 text-sm uppercase tracking-wider">Status</th>
                  <th className="pb-4 font-semibold text-slate-400 text-sm uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-medium text-slate-900">{tx.id}</td>
                    <td className="py-4 text-slate-600">{tx.user}</td>
                    <td className="py-4 text-slate-500 text-sm">{tx.date}</td>
                    <td className="py-4 font-bold text-slate-900">{tx.amount}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
