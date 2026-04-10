import React, { useEffect, useState } from 'react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { Card } from '@/src/components/ui/Card';
import { adminService, PlatformStats } from '@/src/services/adminService';
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const MOCK_CHART_DATA = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 600 },
  { name: 'Mar', users: 850 },
  { name: 'Apr', users: 1248 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPlatformStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <AdminLayout title="Overview" description="Platform health and growth metrics.">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-white/40 font-black uppercase tracking-widest">Memuat Statistik Platform...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Platform Overview" 
      description="Real-time performance monitoring dashboard."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={Users} 
          label="Total Pengguna" 
          value={stats.totalUsers.toLocaleString()} 
          change="+12%" 
          trend="up"
        />
        <StatCard 
          icon={Activity} 
          label="Aktif 24 Jam" 
          value={stats.activeUsers24h.toLocaleString()} 
          change="+5%" 
          trend="up"
        />
        <StatCard 
          icon={CreditCard} 
          label="Revenue (Rp)" 
          value={stats.totalRevenue.toLocaleString()} 
          change={`+${stats.revenueGrowth}%`} 
          trend="up"
        />
        <StatCard 
          icon={ShieldCheck} 
          label="System Health" 
          value={stats.systemHealth} 
          status={stats.systemHealth}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black uppercase tracking-widest text-sm">User Growth</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Registrations
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  fontWeight="black"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  fontWeight="black"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '16px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6 bg-indigo-500 text-white border-none relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <Zap className="w-8 h-8 mb-4 fill-white" />
              <h3 className="text-xl font-black mb-2 uppercase italic tracking-tighter">System Audit</h3>
              <p className="text-xs font-bold opacity-80 mb-6">Jalankan audit keamanan dan integritas data untuk memastikan platform berjalan optimal.</p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/90 transition-colors">Run Audit Now</button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-black uppercase tracking-widest text-xs mb-6">Recent Alerts</h3>
            <div className="space-y-4">
              <AlertItem type="success" title="Backup Complete" time="2h ago" />
              <AlertItem type="warning" title="Spike in Login Failures" time="5h ago" />
              <AlertItem type="info" title="Update v1.2.4 Deployed" time="1d ago" />
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, change, trend, status }: any) {
  return (
    <Card className="p-6 group hover:border-indigo-500/30 transition-all duration-500">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:bg-indigo-500/10 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
            trend === 'up' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        )}
        {status && (
          <div className={cn(
            "flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
            status === 'Healthy' ? "bg-green-500 text-dark" : "bg-orange-500 text-dark"
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-dark animate-pulse" />
            {status}
          </div>
        )}
      </div>
      <div>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

function AlertItem({ type, title, time }: any) {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    info: 'bg-indigo-500',
  };
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className={cn("w-1.5 h-8 rounded-full opacity-20 group-hover:opacity-100 transition-opacity", (colors as any)[type] || 'bg-white/10')} />
      <div className="flex-1">
        <h4 className="text-xs font-black uppercase tracking-wider">{title}</h4>
        <p className="text-[10px] text-white/30 font-bold uppercase">{time}</p>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
