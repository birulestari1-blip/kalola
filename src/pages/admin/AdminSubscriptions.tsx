import React, { useEffect, useState } from 'react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { adminService, AdminSubscription } from '@/src/services/adminService';
import { 
  CreditCard, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  Filter,
  Loader2,
  TrendingUp,
  DollarSign,
  PieChart
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRecentSubscriptions();
      setSubs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      title="Subscription Center" 
      description="Lacak pendapatan, transaksi, dan performa paket premium."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card className="p-8 relative overflow-hidden group border-none bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Total MRR (Monthly Recurring Revenue)</p>
            <h3 className="text-4xl font-black mb-4">Rp 45.200.000</h3>
            <div className="flex items-center gap-2 text-white/80 font-black text-[10px] uppercase tracking-widest bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/10">
              <TrendingUp className="w-3.5 h-3.5" /> +15.5% dari bulan lalu
            </div>
          </div>
        </Card>

        <Card className="p-8 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Plan Distribution</p>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Premium Users</h3>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4">
            <PlanProgress label="Pro Plan" count={85} total={120} color="bg-indigo-500" />
            <PlanProgress label="Starter Plan" count={35} total={120} color="bg-blue-500" />
          </div>
        </Card>

        <Card className="p-8 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-6">
                <div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Churn Rate</p>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Retention</h3>
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-red-400">
                <TrendingUp className="w-5 h-5 rotate-180" />
                </div>
            </div>
            <div className="text-4xl font-black mb-2">2.4%</div>
            <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">Relatively low churn this month</p>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <h3 className="font-black uppercase tracking-widest text-sm">Recent Transactions</h3>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search tx ID or name..."
                className="w-full h-10 pl-11 pr-4 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <Button variant="ghost" size="sm" className="p-2.5 min-w-0 border border-white/5">
              <Download className="w-4 h-4 text-white/40" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-white/40 font-black uppercase tracking-widest">Loading Transactions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/2">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Transaction ID</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">User</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Plan</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-black uppercase tracking-widest">
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-8 py-6 text-[10px] font-mono text-white/40">#{s.id}</td>
                    <td className="px-8 py-6 text-sm">{s.userName}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px]",
                        s.plan === 'Pro' ? "bg-indigo-500/10 text-indigo-400" : "bg-blue-500/10 text-blue-400"
                      )}>{s.plan}</span>
                    </td>
                    <td className="px-8 py-6 text-sm">Rp {s.amount.toLocaleString()}</td>
                    <td className="px-8 py-6 text-[10px] text-white/40">{s.date}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 text-green-500 text-[10px]">
                        <CheckCircle2 className="w-4 h-4" /> SUCCESS
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}

function PlanProgress({ label, count, total, color }: any) {
  const percentage = (count / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-white/40">{label}</span>
        <span>{count} / {total}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
