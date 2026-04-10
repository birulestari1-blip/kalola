import PageLayout from '@/src/components/PageLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  ChevronDown,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle2,
  FileText,
  Share2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { dbService } from '@/src/services/dbService';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

const MONTHLY_DATA = [
  { name: 'Jan', income: 8000000, expense: 4500000, savings: 3500000 },
  { name: 'Feb', income: 8000000, expense: 5200000, savings: 2800000 },
  { name: 'Mar', income: 8500000, expense: 3800000, savings: 4700000 },
  { name: 'Apr', income: 8000000, expense: 3550000, savings: 4450000 },
  { name: 'Mei', income: 9000000, expense: 4100000, savings: 4900000 },
  { name: 'Jun', income: 8500000, expense: 4800000, savings: 3700000 },
];

const CATEGORY_DATA = [
  { name: 'Makanan', value: 1500000, color: '#d4ff00' },
  { name: 'Transportasi', value: 800000, color: '#3b82f6' },
  { name: 'Hiburan', value: 500000, color: '#f59e0b' },
  { name: 'Tagihan', value: 1200000, color: '#ef4444' },
  { name: 'Lainnya', value: 300000, color: '#94a3b8' },
];

const TOP_SPENDING = [
  { name: 'Sewa Apartemen', category: 'Tagihan', amount: 1200000, date: '01 Jun 2024' },
  { name: 'Belanja Bulanan', category: 'Makanan', amount: 850000, date: '05 Jun 2024' },
  { name: 'Tiket Konser', category: 'Hiburan', amount: 500000, date: '12 Jun 2024' },
  { name: 'Service Motor', category: 'Transportasi', amount: 350000, date: '15 Jun 2024' },
];

export default function LaporanPage() {
  const [period, setPeriod] = useState('Bulanan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wallets, transactions, assets, debts, investments] = await Promise.all([
        dbService.getWallets(),
        dbService.getTransactions(),
        dbService.getAssets(),
        dbService.getDebts(),
        dbService.getInvestments()
      ]);

      // Process data for charts
      const monthlyData = [
        { name: 'Jan', income: 0, expense: 0, savings: 0 },
        { name: 'Feb', income: 0, expense: 0, savings: 0 },
        { name: 'Mar', income: 0, expense: 0, savings: 0 },
        { name: 'Apr', income: 0, expense: 0, savings: 0 },
        { name: 'Mei', income: 0, expense: 0, savings: 0 },
        { name: 'Jun', income: 0, expense: 0, savings: 0 },
      ];

      const categoryMap = new Map<string, number>();
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach((t: any) => {
        const date = new Date(t.date);
        const month = date.getMonth();
        if (month < 6) {
          if (t.type === 'income') {
            monthlyData[month].income += t.amount;
            totalIncome += t.amount;
          } else if (t.type === 'expense') {
            monthlyData[month].expense += t.amount;
            totalExpense += t.amount;
            categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
          }
        }
      });

      monthlyData.forEach(m => m.savings = m.income - m.expense);

      const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      })).sort((a, b) => b.value - a.value);

      const totalAssetsValue = assets.reduce((acc, curr) => acc + curr.value, 0) + 
                         investments.reduce((acc, curr) => acc + curr.current_value, 0) +
                         wallets.reduce((acc, curr) => acc + curr.balance, 0);
      const totalDebtsValue = debts.reduce((acc, curr) => acc + curr.amount, 0);
      const netWorthValue = totalAssetsValue - totalDebtsValue;

      const netWorthTrend = monthlyData.map((d, i) => ({
        name: d.name,
        value: netWorthValue - (monthlyData.slice(i + 1).reduce((acc, curr) => acc + curr.savings, 0))
      }));

      setReportData({
        monthlyData,
        categoryData,
        totalIncome,
        totalExpense,
        totalSavings: totalIncome - totalExpense,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0,
        netWorth: netWorthValue,
        netWorthTrend,
        incomeChange: 5.2, // Mocked for now
        expenseChange: -2.1 // Mocked for now
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  if (loading) {
    return (
      <PageLayout title="Laporan" description="Memuat data laporan...">
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 text-neon animate-spin" />
          <p className="text-white/40 font-black uppercase tracking-widest">Menganalisis Keuanganmu...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !reportData) {
    return (
      <PageLayout title="Laporan" description="Terjadi kesalahan">
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-500 font-bold">{error || 'Data tidak tersedia'}</p>
          <Button onClick={fetchData} variant="neon">Coba Lagi</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Laporan" 
      description="Analisis mendalam pengeluaran dan pemasukan bulanan."
      actions={
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Download PDF'}</span>
            <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
          </Button>
          <Button 
            variant="neon"
            className="flex-1 sm:flex-none"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Bagikan</span>
          </Button>
        </div>
      }
    >
      {/* Period Selector & Quick Stats */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 sm:gap-6">
          <div className="flex bg-dark-lighter p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            {['Mingguan', 'Bulanan', 'Tahunan', 'Kustom'].map((p) => (
              <Button
                key={p}
                variant="ghost"
                onClick={() => setPeriod(p)}
                className={cn(
                  "flex-1 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all p-0 min-w-0 min-w-[80px]",
                  period === p ? "bg-neon text-dark" : "text-white/40 hover:text-white"
                )}
              >
                {p}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-white/40 text-sm font-bold">
            <Calendar className="w-4 h-4" />
            {period === 'Kustom' && startDate && endDate 
              ? `${startDate} - ${endDate}`
              : 'Januari 2024 - Juni 2024'}
          </div>
        </div>

        {period === 'Kustom' && (
          <Card className="p-6 animate-in fade-in slide-in-from-top-4 duration-300">
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
              <Button 
                variant="primary"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-6 py-3"
              >
                Reset
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Pemasukan', value: `Rp ${reportData.totalIncome.toLocaleString()}`, trend: `${reportData.incomeChange.toFixed(1)}%`, positive: reportData.incomeChange > 0, icon: ArrowUpRight },
          { label: 'Total Pengeluaran', value: `Rp ${reportData.totalExpense.toLocaleString()}`, trend: `${reportData.expenseChange.toFixed(1)}%`, positive: reportData.expenseChange < 0, icon: ArrowDownRight },
          { label: 'Total Tabungan', value: `Rp ${reportData.totalSavings.toLocaleString()}`, trend: '+18.4%', positive: true, icon: TrendingUp },
          { label: 'Savings Rate', value: `${reportData.savingsRate.toFixed(1)}%`, trend: 'Ideal', positive: true, icon: Target },
        ].map((stat, i) => (
          <Card key={i} className="p-4 sm:p-6 relative overflow-hidden group">
            <stat.icon className="absolute -right-2 -bottom-2 w-12 h-12 sm:w-16 sm:h-16 text-white/5 group-hover:text-white/10 transition-colors" />
            <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">{stat.label}</div>
            <div className="text-xl sm:text-2xl font-black mb-1 sm:mb-2">{stat.value}</div>
            <div className={cn(
              "text-xs font-bold flex items-center gap-1",
              stat.positive ? "text-neon" : "text-red-500"
            )}>
              {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {stat.trend} vs bln lalu
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Cash Flow Chart */}
        <Card className="lg:col-span-2 p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-lg sm:text-xl font-black">Arus Kas Bulanan</h3>
            <div className="flex gap-4 text-[10px] sm:text-xs font-bold">
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Pemasukan
              </div>
              <div className="flex items-center gap-2 text-neon">
                <div className="w-2 h-2 rounded-full bg-neon" />
                Pengeluaran
              </div>
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000000}jt`} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="expense" fill="#d4ff00" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Net Worth Trend */}
        <Card className="p-8">
          <h3 className="text-xl font-black mb-8">Tren Kekayaan Bersih</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.netWorthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  formatter={(v: number) => `Rp ${v.toLocaleString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Total Kekayaan</div>
            <div className="text-lg font-black">Rp {reportData.netWorth.toLocaleString()}</div>
            <p className="text-[10px] text-white/40 font-bold">Total akumulasi aset dikurangi utang.</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <Card className="p-8">
          <h3 className="text-xl font-black mb-8">Alokasi Pengeluaran</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportData.categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {reportData.categoryData.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white/60">{item.name}</span>
                </div>
                <span className="font-bold">Rp {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Financial Insights */}
        <Card className="lg:col-span-2 bg-neon text-dark p-6 sm:p-8 relative overflow-hidden border-none">
          <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-lg sm:text-xl font-black">AI Financial Insight & Forecast</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-[10px] sm:text-xs uppercase tracking-wider mb-1">Kesehatan Keuangan</div>
                  <p className="text-xs sm:text-sm font-bold opacity-80">Rasio tabungan kamu saat ini adalah {reportData.savingsRate.toFixed(1)}%. Ini sudah sangat baik!</p>
                </div>
              </div>

              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-[10px] sm:text-xs uppercase tracking-wider mb-1">Kekayaan Bersih</div>
                  <p className="text-xs sm:text-sm font-bold opacity-80">Net worth kamu Rp {reportData.netWorth.toLocaleString()}. Pertahankan tren positif ini.</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-dark/5 rounded-3xl border border-dark/10">
              <div className="text-[9px] font-black uppercase tracking-widest mb-4 opacity-60">Prediksi Bulan Depan</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">Estimasi Pengeluaran</span>
                  <span className="font-black">Rp 4.250.000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">Potensi Tabungan</span>
                  <span className="font-black">Rp 4.750.000</span>
                </div>
                <div className="pt-4 border-t border-dark/10">
                  <div className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Health Score</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl sm:text-4xl font-black">85</div>
                    <div className="text-[10px] sm:text-sm font-bold mb-1">/ 100</div>
                  </div>
                  <div className="w-full h-1.5 bg-dark/10 rounded-full mt-3 overflow-hidden">
                    <div className="w-[85%] h-full bg-dark" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
