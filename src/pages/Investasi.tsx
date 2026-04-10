import PageLayout from '@/src/components/PageLayout';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  X, 
  Calendar, 
  Briefcase, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sparkles,
  Globe,
  Wallet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { Input, Select } from '@/src/components/ui/Input';
import { dbService, Investment as DBInvestment } from '@/src/services/dbService';
import { useAuth } from '@/src/lib/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

interface Dividend {
  id: string;
  amount: number;
  date: string;
  assetName: string;
}

interface Investment {
  id: string;
  name: string;
  category: 'Saham' | 'Crypto' | 'Reksadana' | 'Obligasi' | 'Lainnya';
  platform: string;
  principal: number;
  currentValue: number;
  purchaseDate: string;
  color: string;
  risk: 'Low' | 'Medium' | 'High';
  dividends: Dividend[];
}

interface WatchlistItem {
  id: string;
  name: string;
  price: number;
  change: number;
}

const CATEGORIES = [
  { name: 'Saham', color: '#3b82f6' },
  { name: 'Crypto', color: '#f59e0b' },
  { name: 'Reksadana', color: '#10b981' },
  { name: 'Obligasi', color: '#8b5cf6' },
  { name: 'Lainnya', color: '#94a3b8' },
];

const PERFORMANCE_DATA = [
  { month: 'Jan', value: 45000000 },
  { month: 'Feb', value: 52000000 },
  { month: 'Mar', value: 48000000 },
  { month: 'Apr', value: 61000000 },
  { month: 'May', value: 55000000 },
  { month: 'Jun', value: 67000000 },
];

export default function InvestasiPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<DBInvestment[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [investmentData, walletData] = await Promise.all([
        dbService.getInvestments(),
        dbService.getWallets()
      ]);
      setInvestments(investmentData);
      setWallets(walletData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = fetchData;

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { id: 'w1', name: 'AAPL', price: 185.4, change: 1.2 },
    { id: 'w2', name: 'ETH', price: 3450.2, change: -0.8 },
    { id: 'w3', name: 'TLKM', price: 3850, change: 0.5 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<DBInvestment | null>(null);
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<DBInvestment | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Saham' as Investment['category'],
    platform: '',
    principal: '',
    currentValue: '',
    risk: 'Low' as Investment['risk'],
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseWalletId: '',
  });

  const [dividendFormData, setDividendFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receiveWalletId: '',
  });

  const stats = useMemo(() => {
    const totalPrincipal = investments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCurrent = investments.reduce((acc, curr) => acc + curr.current_value, 0);
    const totalProfit = totalCurrent - totalPrincipal;
    const totalROI = totalPrincipal > 0 ? (totalProfit / totalPrincipal) * 100 : 0;
    
    const totalDividends = 0; // Simplified for now

    const allocationData = CATEGORIES.map(cat => {
      const value = investments
        .filter(i => i.type === cat.name)
        .reduce((acc, curr) => acc + curr.current_value, 0);
      return { name: cat.name, value, color: cat.color };
    }).filter(c => c.value > 0);

    const riskData = [
      { name: 'Low', value: investments.filter(i => i.risk === 'Low').reduce((acc, curr) => acc + curr.current_value, 0), color: '#10b981' },
      { name: 'Medium', value: investments.filter(i => i.risk === 'Medium').reduce((acc, curr) => acc + curr.current_value, 0), color: '#f59e0b' },
      { name: 'High', value: investments.filter(i => i.risk === 'High').reduce((acc, curr) => acc + curr.current_value, 0), color: '#ef4444' },
    ].filter(r => r.value > 0);

    return { totalPrincipal, totalCurrent, totalProfit, totalROI, totalDividends, allocationData, riskData };
  }, [investments]);

  const filteredInvestments = useMemo(() => {
    return investments.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.type.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.current_value - a.current_value);
  }, [investments, searchQuery]);

  const openAddModal = () => {
    setEditingInvestment(null);
    setFormData({
      name: '',
      category: 'Saham',
      platform: '',
      principal: '',
      currentValue: '',
      risk: 'Low',
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (i: DBInvestment) => {
    setEditingInvestment(i);
    setFormData({
      name: i.name,
      category: i.type as any,
      platform: i.platform,
      principal: i.amount_invested.toString(),
      currentValue: i.current_value.toString(),
      risk: i.risk as any,
      purchaseDate: i.purchase_date || new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openDividendModal = (i: DBInvestment) => {
    setSelectedInvestment(i);
    setDividendFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsDividendModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setInvestmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const principal = parseFloat(formData.principal) || 0;
      const data = {
        name: formData.name,
        type: formData.category,
        platform: formData.platform,
        amount_invested: principal,
        current_value: parseFloat(formData.currentValue) || 0,
        risk: formData.risk as any,
        purchase_date: formData.purchaseDate,
      };

      if (editingInvestment) {
        await dbService.updateInvestment(editingInvestment.id, data);
      } else {
        await dbService.createInvestment(data);
        
        // If a wallet is selected, create an expense transaction
        if (formData.purchaseWalletId) {
          await dbService.createTransaction({
            name: `Investasi: ${formData.name}`,
            category: 'Investment',
            amount: principal,
            date: formData.purchaseDate,
            wallet_id: formData.purchaseWalletId,
            type: 'expense',
            note: `Pembelian investasi ${formData.name} di ${formData.platform}`
          });
        }
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDividendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInvestment) {
      try {
        const amount = parseFloat(dividendFormData.amount) || 0;
        
        // Update investment value
        await dbService.updateInvestment(selectedInvestment.id, {
          current_value: selectedInvestment.current_value + amount
        });

        // If a wallet is selected, create an income transaction
        if (dividendFormData.receiveWalletId) {
          await dbService.createTransaction({
            name: `Dividen: ${selectedInvestment.name}`,
            category: 'Investment Income',
            amount: amount,
            date: dividendFormData.date,
            wallet_id: dividendFormData.receiveWalletId,
            type: 'income',
            note: `Penerimaan dividen dari ${selectedInvestment.name}`
          });
        }

        fetchData();
        setIsDividendModalOpen(false);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const confirmDelete = async () => {
    if (investmentToDelete) {
      try {
        await dbService.deleteInvestment(investmentToDelete);
        fetchInvestments();
        setIsDeleteModalOpen(false);
        setInvestmentToDelete(null);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <PageLayout 
      title="Investasi" 
      description="Analisis portofolio investasi kamu di berbagai platform."
      actions={
        <Button 
          variant="neon"
          onClick={openAddModal}
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Investasi</span>
          <span className="sm:hidden">Investasi</span>
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-neon animate-spin" />
            <p className="text-white/40 font-black uppercase tracking-widest">Memuat Data Investasi...</p>
          </div>
        ) : error ? (
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-500 font-bold">{error}</p>
            <Button onClick={fetchInvestments} variant="ghost">Coba Lagi</Button>
          </div>
        ) : (
          <>
            <div className="lg:col-span-2 space-y-8">
              {/* Portfolio Summary */}
              {/* Portfolio Summary */}
              <Card className="p-6 sm:p-8 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-neon/10 rounded-full blur-3xl group-hover:bg-neon/20 transition-all sm:opacity-0 sm:group-hover:opacity-100" />
                <div className="flex flex-col sm:flex-row justify-between items-stretch gap-8 relative z-10">
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-glow-neon">Total Nilai Portofolio</div>
                      <div className="text-3xl sm:text-5xl font-black mb-1 truncate max-w-full tracking-tight">Rp {stats.totalCurrent.toLocaleString()}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-4 border-t border-white/5">
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest",
                        stats.totalProfit >= 0 ? "bg-neon/10 text-neon" : "bg-red-500/10 text-red-500"
                      )}>
                        {stats.totalProfit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {stats.totalROI.toFixed(1)}%
                      </div>
                      <div className="text-[10px] sm:text-xs text-white/40 font-black uppercase tracking-widest py-1.5">Modal: Rp {stats.totalPrincipal.toLocaleString()}</div>
                      <div className="text-[10px] sm:text-xs text-neon font-black uppercase tracking-widest bg-neon/5 px-3 py-1.5 rounded-xl border border-neon/10">Dividen: Rp {stats.totalDividends.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-full h-32 sm:h-auto sm:w-48 lg:w-64 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PERFORMANCE_DATA}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#d4ff00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#d4ff00" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

          {/* Investment List */}
              {/* Investment List */}
              <Card className="p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
                  <h3 className="text-xl font-black">Daftar Aset</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari aset atau platform..." 
                      className="pl-11"
                    />
                  </div>
                </div>

            <div className="space-y-4">
                {filteredInvestments.map((inv) => {
                  return (
                    <div key={inv.id} className="group relative bg-white/5 p-4 sm:p-6 rounded-3xl border border-white/5 hover:border-white/10 active:scale-[0.98] sm:active:scale-100 transition-all">
                      {/* Actions */}
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => openEditModal(inv)}
                          className="p-1.5 sm:p-2 min-w-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(inv.id)}
                          className="p-1.5 sm:p-2 min-w-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white/40" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-base sm:text-lg truncate tracking-tight">{inv.name}</h4>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-white/40 font-black uppercase tracking-widest">
                              <span className="truncate max-w-[80px] sm:max-w-none">{inv.platform}</span> 
                              <span className="shrink-0">•</span>
                              <span style={{ color: CATEGORIES.find(c => c.name === inv.type)?.color }}>{inv.type}</span>
                              <span className="shrink-0 hidden sm:inline">•</span>
                              <span className={cn(
                                "hidden sm:inline px-2 py-0.5 rounded-md text-[10px]",
                                inv.risk === 'Low' ? "bg-green-500/10 text-green-500" :
                                inv.risk === 'Medium' ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"
                              )}>{inv.risk} Risk</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-none border-white/5">
                          <div className="text-left sm:text-right">
                            <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-0.5">Nilai Saat Ini</div>
                            <div className="text-xl sm:text-2xl font-black">Rp {inv.current_value.toLocaleString()}</div>
                            <div className={cn(
                              "text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center sm:justify-end gap-1 mt-0.5",
                              (inv.current_value - inv.amount_invested) >= 0 ? "text-neon text-glow-neon" : "text-red-500"
                            )}>
                              {(inv.current_value - inv.amount_invested) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {((inv.current_value - inv.amount_invested) / inv.amount_invested * 100).toFixed(1)}%
                            </div>
                          </div>
                          <Button 
                            variant="neon"
                            size="sm"
                            onClick={() => openDividendModal(inv)}
                            className="p-3 sm:p-2 sm:min-w-0 active:scale-90 transition-transform"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {filteredInvestments.length === 0 && (
                <div className="text-center py-20 text-white/20 font-black uppercase tracking-widest">
                  Tidak ada investasi ditemukan
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Allocation & AI */}
        <div className="space-y-8">
          <Card className="p-8">
            <div className="flex p-1 bg-white/5 rounded-2xl mb-6">
              <Button 
                variant="ghost"
                className="flex-1 py-2 rounded-xl text-xs font-black bg-neon text-dark p-0 min-w-0"
              >
                Kategori
              </Button>
              <Button 
                variant="ghost"
                className="flex-1 py-2 rounded-xl text-xs font-black text-white/40 p-0 min-w-0"
              >
                Risiko
              </Button>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.allocationData.map((entry, index) => (
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
            <div className="w-full space-y-3 mt-4">
              {stats.allocationData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white/60">{item.name}</span>
                  </div>
                  <span className="font-bold">{((item.value / stats.totalCurrent) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Watchlist */}
          <Card className="p-8">
            <h3 className="font-black mb-6 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-neon" />
              Watchlist
            </h3>
            <div className="space-y-4">
              {watchlist.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Market Price</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black">${item.price.toLocaleString()}</div>
                    <div className={cn("text-[10px] font-bold", item.change >= 0 ? "text-neon" : "text-red-500")}>
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Advisor */}
          <Card variant="neon" className="p-8">
            <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-xl font-black">AI Advisor</h3>
            </div>
            <p className="text-sm font-bold leading-relaxed">
              {stats.totalROI > 15 
                ? "Performa portofolio kamu luar biasa! Pertimbangkan untuk mengamankan profit (profit taking) pada aset yang sudah naik signifikan."
                : "Portofolio kamu cukup terdiversifikasi. Tetap konsisten melakukan Dollar Cost Averaging (DCA) untuk hasil maksimal jangka panjang."}
            </p>
          </Card>

          {/* Market Sentiment Mock */}
          <Card className="p-8">
            <h3 className="font-black mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Market Sentiment
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">IHSG</span>
                <span className="text-sm font-bold text-neon">+0.45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">S&P 500</span>
                <span className="text-sm font-bold text-neon">+1.20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Bitcoin</span>
                <span className="text-sm font-bold text-red-500">-2.15%</span>
              </div>
            </div>
          </Card>
        </div>
      </>
    )}
  </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInvestment ? 'Edit Investasi' : 'Tambah Investasi Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nama Aset"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Misal: BBCA, BTC"
            />
            <Input 
              label="Platform"
              required
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              placeholder="Misal: Stockbit, Bibit"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Investment['category'] })}
              options={CATEGORIES.map(c => ({ label: c.name, value: c.name }))}
            />
            <Select 
              label="Profil Risiko"
              value={formData.risk}
              onChange={(e) => setFormData({ ...formData, risk: e.target.value as Investment['risk'] })}
              options={[
                { label: 'Low Risk', value: 'Low' },
                { label: 'Medium Risk', value: 'Medium' },
                { label: 'High Risk', value: 'High' },
              ]}
            />
          </div>

          <Input 
            label="Tanggal Beli"
            type="date"
            required
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Modal Awal (Rp)"
              type="number"
              required
              value={formData.principal}
              onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
              placeholder="0"
            />
            <Input 
              label="Nilai Saat Ini (Rp)"
              type="number"
              required
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
              placeholder="0"
            />
          </div>

          {!editingInvestment && (
            <Select 
              label="Bayar dari Dompet (Opsional)"
              value={formData.purchaseWalletId}
              onChange={(e) => setFormData({ ...formData, purchaseWalletId: e.target.value })}
              options={[
                { label: 'Jangan catat sebagai pengeluaran', value: '' },
                ...wallets.map(w => ({ label: `${w.name} (Rp ${w.balance.toLocaleString()})`, value: w.id }))
              ]}
            />
          )}

          <Button 
            type="submit"
            variant="neon"
            className="w-full py-4"
          >
            {editingInvestment ? 'Simpan Perubahan' : 'Tambah Investasi'}
          </Button>
        </form>
      </Modal>

      {/* Dividend Modal */}
      <Modal
        isOpen={isDividendModalOpen}
        onClose={() => setIsDividendModalOpen(false)}
        title="Tambah Dividen"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleDividendSubmit} className="space-y-6">
          <div className="text-center">
            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Aset</div>
            <div className="text-lg font-bold">{selectedInvestment?.name}</div>
          </div>

          <Input 
            label="Jumlah Dividen (Rp)"
            required
            autoFocus
            type="number" 
            value={dividendFormData.amount}
            onChange={(e) => setDividendFormData({ ...dividendFormData, amount: e.target.value })}
            placeholder="0"
            className="text-center text-2xl font-black"
          />

          <Input 
            label="Tanggal Terima"
            type="date"
            required
            value={dividendFormData.date}
            onChange={(e) => setDividendFormData({ ...dividendFormData, date: e.target.value })}
          />

          <Select 
            label="Terima ke Dompet (Opsional)"
            value={dividendFormData.receiveWalletId}
            onChange={(e) => setDividendFormData({ ...dividendFormData, receiveWalletId: e.target.value })}
            options={[
              { label: 'Jangan catat sebagai pemasukan', value: '' },
              ...wallets.map(w => ({ label: w.name, value: w.id }))
            ]}
          />

          <Button 
            type="submit"
            variant="neon"
            className="w-full py-4"
          >
            Simpan Dividen
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Investasi?"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm mb-8">
            Tindakan ini akan menghapus catatan investasi ini dari portofolio kamu.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="primary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              variant="danger"
              onClick={confirmDelete}
              className="flex-1"
            >
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
