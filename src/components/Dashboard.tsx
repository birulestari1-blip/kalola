import PageLayout from './PageLayout';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Target, 
  Calendar, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  PieChart as PieChartIcon,
  Activity,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '../lib/AuthContext';
import { dbService, Wallet, Transaction } from '../services/dbService';
import { useNavigate } from 'react-router-dom';

const CASH_FLOW_DATA = [
// ... (rest of data)
  { name: 'Sen', income: 0, expense: 450000 },
  { name: 'Sel', income: 8000000, expense: 120000 },
  { name: 'Rab', income: 0, expense: 850000 },
  { name: 'Kam', income: 500000, expense: 300000 },
  { name: 'Jum', income: 0, expense: 1200000 },
  { name: 'Sab', income: 200000, expense: 2400000 },
  { name: 'Min', income: 0, expense: 600000 },
];

const GOALS = [
  { name: 'Dana Darurat', current: 15000000, target: 50000000, color: 'bg-neon' },
  { name: 'Liburan Jepang', current: 8500000, target: 25000000, color: 'bg-blue-500' },
  { name: 'iPhone 15 Pro', current: 12000000, target: 20000000, color: 'bg-purple-500' },
];

const UPCOMING_BILLS = [
  { name: 'Listrik & Air', amount: 450000, date: '12 Apr', status: 'urgent' },
  { name: 'Internet (Indihome)', amount: 385000, date: '15 Apr', status: 'pending' },
  { name: 'Cicilan Motor', amount: 1200000, date: '20 Apr', status: 'pending' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletData, transData, goalData, assetData, debtData, investmentData] = await Promise.all([
        dbService.getWallets(),
        dbService.getTransactions(),
        dbService.getGoals(),
        dbService.getAssets(),
        dbService.getDebts(),
        dbService.getInvestments()
      ]);
      setWallets(walletData);
      setTransactions(transData);
      setGoals(goalData);
      setAssets(assetData);
      setDebts(debtData);
      setInvestments(investmentData);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const balance = wallets.reduce((acc, w) => acc + w.balance, 0);
    const totalAssets = assets.reduce((acc, a) => acc + a.value, 0);
    const totalInvestments = investments.reduce((acc, i) => acc + i.current_value, 0);
    const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);
    
    const netWorth = balance + totalAssets + totalInvestments - totalDebts;
    
    // Calculate income/expense for current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTrans = transactions.filter(t => new Date(t.date) >= firstDay);
    const income = monthlyTrans.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = monthlyTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    return { balance, income, expense, netWorth, totalDebts };
  }, [wallets, transactions, assets, debts, investments]);

  const cashFlowData = useMemo(() => {
    // Group last 7 days
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dayStr = d.toISOString().split('T')[0];
      
      const dayTrans = transactions.filter(t => t.date === dayStr);
      const income = dayTrans.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = dayTrans.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      
      result.push({ name: dayName, income, expense });
    }
    return result;
  }, [transactions]);

  return (
    <PageLayout 
      title={`Halo, ${user?.user_metadata?.full_name || 'User'}! 👋`}
      description="Ini ringkasan keuangan kamu hari ini."
      actions={
        <>
          <Button 
            variant="primary"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-white/10 border-neon/50 text-neon")}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{startDate || endDate ? 'Filter Aktif' : 'Filter Tanggal'}</span>
          </Button>
          <Button variant="neon" onClick={() => navigate('/trans')}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Catat Transaksi</span>
          </Button>
        </>
      }
    >
      <div className="custom-scrollbar overflow-x-hidden">

        {showFilters && (
          <Card className="mb-8 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="flex-1">
                <Input 
                  label="Dari Tanggal"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input 
                  label="Sampai Tanggal"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="primary"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Reset
                </Button>
                <Button 
                  variant="neon"
                  onClick={() => setShowFilters(false)}
                >
                  Terapkan
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-neon animate-spin mb-4" />
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Memuat dashboard...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-white/60 font-bold mb-4">{error}</p>
            <Button variant="primary" onClick={fetchData}>Coba Lagi</Button>
          </div>
        ) : (
          <>
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="p-5 sm:p-6 relative overflow-hidden group border-white/5 active:bg-white/5 transition-colors">
            <div className="absolute -right-4 -top-4 w-20 sm:w-24 h-20 sm:h-24 bg-neon/5 rounded-full blur-2xl group-hover:bg-neon/10 transition-all sm:opacity-0 sm:group-hover:opacity-100" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neon/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp className="text-neon w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest truncate">Kekayaan Bersih</span>
            </div>
            <div className="text-xl sm:text-2xl font-black truncate">Rp {stats.netWorth.toLocaleString()}</div>
            <div className="text-neon text-[9px] sm:text-[10px] font-bold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +2.4% dari bulan lalu
            </div>
          </Card>

          <Card className="p-5 sm:p-6 relative overflow-hidden group border-white/5 active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <ArrowDownLeft className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest truncate">Pemasukan</span>
            </div>
            <div className="text-xl sm:text-2xl font-black truncate">Rp {stats.income.toLocaleString()}</div>
            <div className="text-white/20 text-[9px] sm:text-[10px] font-bold mt-2">{startDate || endDate ? 'Periode Terpilih' : 'Bulan ini'}</div>
          </Card>

          <Card className="p-5 sm:p-6 relative overflow-hidden group border-white/5 active:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <ArrowUpRight className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest truncate">Pengeluaran</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white truncate">Rp {stats.expense.toLocaleString()}</div>
            <div className="text-white/20 text-[9px] sm:text-[10px] font-bold mt-2">{startDate || endDate ? 'Periode Terpilih' : 'Bulan ini'}</div>
          </Card>

          <Card className="p-5 sm:p-6 relative overflow-hidden group border-red-500/10 bg-red-500/[0.02] active:bg-red-500/[0.05] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest truncate">Total Utang</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-500 truncate">Rp {stats.totalDebts.toLocaleString()}</div>
            <div className="text-white/20 text-[9px] sm:text-[10px] font-bold mt-2 mb-0">Segera lunasi utangmu!</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <CardTitle>Arus Kas Mingguan</CardTitle>
                <p className="text-white/40 text-xs">Perbandingan pemasukan dan pengeluaran 7 hari terakhir.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neon" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Expense</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '16px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#ccff00" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#ffffff20" 
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Upcoming Bills */}
          <Card className="p-8">
            <div className="flex justify-between items-center mb-6">
              <CardTitle>Tagihan Mendatang</CardTitle>
              <Calendar className="w-5 h-5 text-white/20" />
            </div>
            <div className="space-y-4">
              {UPCOMING_BILLS.map((bill, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        bill.status === 'urgent' ? "bg-red-500/10 text-red-500" : "bg-white/10 text-white/40"
                      )}>
                        {bill.status === 'urgent' ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{bill.name}</div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{bill.date}</div>
                      </div>
                    </div>
                    <div className="text-sm font-black text-white">Rp {bill.amount.toLocaleString()}</div>
                  </div>
                  {bill.status === 'urgent' && (
                    <div className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-2">
                      <AlertCircle className="w-3 h-3" />
                      Segera Bayar!
                    </div>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-white/20 hover:text-white flex items-center justify-center gap-2">
                Lihat Semua Tagihan
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="p-5 sm:p-8">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <CardTitle className="text-lg sm:text-xl">Transaksi Terakhir</CardTitle>
              <Button variant="ghost" size="sm" className="text-neon hover:text-neon-dark p-0 text-xs uppercase font-black tracking-widest" onClick={() => navigate('/trans')}>Lihat Semua</Button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {transactions.slice(0, 5).map((t, i) => (
                <div key={i} className="flex justify-between items-center p-3 sm:p-4 bg-white/[0.02] sm:bg-transparent sm:hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group active:bg-white/10">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shrink-0",
                      t.type === 'income' ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white/40 group-hover:bg-white/10"
                    )}>
                      {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" /> : <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm truncate">{t.name}</div>
                      <div className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest truncate">{t.category} • {t.date}</div>
                    </div>
                  </div>
                  <div className={cn("font-black text-xs sm:text-sm shrink-0 ml-3", t.type === 'income' ? "text-green-500" : "text-white")}>
                    {t.type === 'income' ? '+' : '-'}Rp {t.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-10 text-white/20 font-bold text-xs uppercase tracking-widest">Belum ada transaksi.</div>
              )}
            </div>
          </Card>

          {/* Goals Progress */}
          <Card className="p-8">
            <div className="flex justify-between items-center mb-8">
              <CardTitle>Target Keuangan</CardTitle>
              <Target className="w-5 h-5 text-white/20" />
            </div>
            <div className="space-y-8">
              {goals.map((goal, i) => {
                const progress = (goal.current / (goal.target_amount || goal.target)) * 100;
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-sm font-bold mb-1">{goal.title}</div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                          Rp {goal.current.toLocaleString()} / Rp {(goal.target_amount || goal.target).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs font-black text-white">{progress.toFixed(0)}%</div>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", goal.color)} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <Button 
                variant="ghost" 
                onClick={() => navigate('/goals')}
                className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl text-white/20 hover:border-neon/50 hover:text-neon transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" />
                Tambah Target Baru
              </Button>
            </div>
          </Card>
        </div>
        </>
        )}
      </div>
    </PageLayout>
  );
}
