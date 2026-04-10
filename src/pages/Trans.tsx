import PageLayout from '@/src/components/PageLayout';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Plus, 
  Pencil, 
  Trash2, 
  X,
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
  RefreshCw,
  PieChart,
  CheckSquare,
  Square,
  FileText,
  Image as ImageIcon,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { dbService, Transaction as DBTransaction, Wallet as DBWallet } from '@/src/services/dbService';
import { useAuth } from '@/src/lib/AuthContext';
import { Card, CardTitle } from '@/src/components/ui/Card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SplitItem {
  category: string;
  amount: number;
}

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  wallet: string;
  type: 'income' | 'expense';
  isRecurring?: boolean;
  receiptUrl?: string;
  splits?: SplitItem[];
}

const CATEGORIES = [
  'Food & Drink', 'Income', 'Groceries', 'Entertainment', 
  'Transport', 'Shopping', 'Health', 'Bills', 'Others'
];

const WALLETS = ['BCA Main', 'GoPay', 'Mandiri Savings', 'Jenius', 'Cash'];

export default function TransPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<DBWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transData, walletData] = await Promise.all([
        dbService.getTransactions(),
        dbService.getWallets()
      ]);
      setTransactions(transData);
      setWallets(walletData);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterWallet, setFilterWallet] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Food & Drink',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    wallet_id: '',
    type: 'expense' as 'income' | 'expense',
    isRecurring: false,
    receiptUrl: '',
    splits: [] as SplitItem[]
  });

  const QUICK_TEMPLATES = [
    { name: 'Kopi Pagi', category: 'Food & Drink', amount: 25000, type: 'expense', wallet: 'GoPay' },
    { name: 'Makan Siang', category: 'Food & Drink', amount: 50000, type: 'expense', wallet: 'BCA Main' },
    { name: 'Bensin', category: 'Transport', amount: 100000, type: 'expense', wallet: 'Cash' },
    { name: 'Top Up GoPay', category: 'Others', amount: 200000, type: 'expense', wallet: 'BCA Main' },
  ];

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.wallet.toLowerCase().includes(searchQuery.toLowerCase());
      
      const transactionDate = new Date(t.date);
      const matchesStartDate = startDate ? transactionDate >= new Date(startDate) : true;
      const matchesEndDate = endDate ? transactionDate <= new Date(endDate) : true;
      const matchesCategory = filterCategory === 'All' ? true : t.category === filterCategory;
      const matchesWallet = filterWallet === 'All' ? true : t.wallet === filterWallet;

      return matchesSearch && matchesStartDate && matchesEndDate && matchesCategory && matchesWallet;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, startDate, endDate, filterCategory, filterWallet]);

  // Insights based on filtered data
  const insights = useMemo(() => {
    if (filteredTransactions.length === 0) return null;

    const categoryCounts: Record<string, number> = {};
    const walletCounts: Record<string, number> = {};

    filteredTransactions.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + t.amount;
      walletCounts[t.wallet] = (walletCounts[t.wallet] || 0) + 1;
    });

    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    const topWallet = Object.entries(walletCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      topWallet: topWallet ? { name: topWallet[0], count: topWallet[1] } : null
    };
  }, [filteredTransactions]);

  // Stats calculation based on filtered transactions
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsSplitMode(false);
    setFormData({
      name: '',
      category: 'Food & Drink',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      wallet: 'BCA Main',
      type: 'expense',
      isRecurring: false,
      receiptUrl: '',
      splits: []
    });
    setIsModalOpen(true);
  };

  const useTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setEditingTransaction(null);
    setIsSplitMode(false);
    setFormData({
      name: template.name,
      category: template.category,
      amount: template.amount.toString(),
      date: new Date().toISOString().split('T')[0],
      wallet: template.wallet,
      type: template.type as 'income' | 'expense',
      isRecurring: false,
      receiptUrl: '',
      splits: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setIsSplitMode(!!t.splits && t.splits.length > 0);
    setFormData({
      name: t.name,
      category: t.category,
      amount: t.amount.toString(),
      date: t.date,
      wallet: t.wallet,
      type: t.type,
      isRecurring: t.isRecurring || false,
      receiptUrl: t.receiptUrl || '',
      splits: t.splits || []
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      category: isSplitMode ? 'Split Transaction' : formData.category,
      amount: isSplitMode 
        ? formData.splits.reduce((acc, s) => acc + s.amount, 0)
        : (parseFloat(formData.amount) || 0),
      date: formData.date,
      wallet_id: formData.wallet_id,
      type: formData.type,
      note: formData.receiptUrl // Using receiptUrl as note for now or add note field
    };

    try {
      if (editingTransaction) {
        const updated = await dbService.updateTransaction(editingTransaction.id, data as any);
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? updated : t));
      } else {
        const created = await dbService.createTransaction(data as any);
        setTransactions([created, ...transactions]);
      }
      // Refresh wallets to update balances
      const walletData = await dbService.getWallets();
      setWallets(walletData);
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan transaksi: ' + err.message);
    }
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await dbService.deleteTransaction(transactionToDelete);
        setTransactions(transactions.filter(t => t.id !== transactionToDelete));
        // Refresh wallets to update balances
        const walletData = await dbService.getWallets();
        setWallets(walletData);
        setIsDeleteModalOpen(false);
        setTransactionToDelete(null);
      } catch (err: any) {
        alert('Gagal menghapus transaksi: ' + err.message);
      }
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Nama', 'Kategori', 'Jumlah', 'Tanggal', 'Dompet', 'Tipe'];
    const rows = filteredTransactions.map(t => [
      t.id, t.name, t.category, t.amount, t.date, t.wallet, t.type
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Hapus ${selectedIds.length} transaksi terpilih?`)) {
      setTransactions(prev => prev.filter(t => !selectedIds.includes(t.id)));
      setSelectedIds([]);
    }
  };

  return (
    <PageLayout 
      title="Transaksi" 
      description="Riwayat semua pengeluaran dan pemasukan kamu."
      actions={
        <div className="flex gap-2">
          <Button 
            variant="primary"
            onClick={handleExport}
            className="flex-1 sm:flex-none"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            variant="neon"
            onClick={openAddModal}
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Catat Transaksi</span>
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-neon animate-spin mb-4" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Memuat data transaksi...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white/60 font-bold mb-4">{error}</p>
          <Button variant="primary" onClick={fetchData}>Coba Lagi</Button>
        </div>
      ) : (
        <>
          {/* Quick Templates */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon" />
            <span className="text-xs font-black uppercase tracking-widest text-white/40">Template Cepat</span>
          </div>
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-white/20 hover:text-white transition-colors"
          >
            {showTemplates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {showTemplates && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {QUICK_TEMPLATES.map((template, i) => (
              <button
                key={i}
                onClick={() => useTemplate(template)}
                className="bg-dark-lighter p-4 rounded-2xl border border-white/5 hover:border-neon/30 hover:bg-white/5 transition-all text-left group"
              >
                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 group-hover:text-neon transition-colors">{template.category}</div>
                <div className="font-bold text-sm mb-1">{template.name}</div>
                <div className="text-xs font-black text-white/60">Rp {template.amount.toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Pemasukan</span>
          </div>
          <div className="text-2xl font-black text-green-500">Rp {stats.income.toLocaleString()}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Pengeluaran</span>
          </div>
          <div className="text-2xl font-black text-white">Rp {stats.expense.toLocaleString()}</div>
        </Card>
        
        <Card className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-white/20 text-[10px] font-black uppercase tracking-widest truncate">Top Kategori</div>
            <div className="text-sm font-black truncate">{insights?.topCategory?.name || '-'}</div>
            <div className="text-[10px] text-white/40 font-bold">Rp {insights?.topCategory?.amount.toLocaleString() || 0}</div>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-500/10 text-cyan-500 rounded-xl flex items-center justify-center shrink-0">
            <WalletIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-white/20 text-[10px] font-black uppercase tracking-widest truncate">Dompet Teraktif</div>
            <div className="text-sm font-black truncate">{insights?.topWallet?.name || '-'}</div>
            <div className="text-[10px] text-white/40 font-bold">{insights?.topWallet?.count || 0} Transaksi</div>
          </div>
        </Card>
      </div>

      <div className="bg-dark-lighter rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi, kategori, atau dompet..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-neon/50 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus ({selectedIds.length})
                </button>
              )}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors",
                  showFilters && "bg-white/10 border-neon/50 text-neon"
                )}
              >
                <Filter className="w-4 h-4" />
                Filter Lanjutan
              </button>
              {(startDate || endDate || filterCategory !== 'All' || filterWallet !== 'All') && (
                <button 
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setFilterCategory('All');
                    setFilterWallet('All');
                  }}
                  className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-neon/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-neon/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Kategori</label>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-neon/50 transition-colors appearance-none"
                >
                  <option value="All">Semua Kategori</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Dompet</label>
                <select 
                  value={filterWallet}
                  onChange={(e) => setFilterWallet(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-neon/50 transition-colors appearance-none"
                >
                  <option value="All">Semua Dompet</option>
                  {wallets.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4 font-black w-10">
                  <button onClick={toggleSelectAll} className="text-white/20 hover:text-white transition-colors">
                    {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-neon" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 font-black">Transaksi</th>
                <th className="px-6 py-4 font-black">Kategori</th>
                <th className="px-6 py-4 font-black">Dompet</th>
                <th className="px-6 py-4 font-black text-right">Jumlah</th>
                <th className="px-6 py-4 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className={cn(
                  "hover:bg-white/5 transition-colors group",
                  selectedIds.includes(t.id) && "bg-neon/5"
                )}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(t.id)} className="text-white/20 hover:text-white transition-colors">
                      {selectedIds.includes(t.id) ? (
                        <CheckSquare className="w-4 h-4 text-neon" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center relative",
                        t.type === 'income' ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white/40"
                      )}>
                        {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        {t.isRecurring && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center border-2 border-dark">
                            <RefreshCw className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {t.name}
                          {t.receiptUrl && <ImageIcon className="w-3 h-3 text-neon" />}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {t.date}
                          {t.splits && t.splits.length > 0 && ` • ${t.splits.length} Kategori`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-white/60">{t.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{t.wallets?.name || t.wallet}</td>
                  <td className={cn(
                    "px-6 py-4 text-right font-black",
                    t.type === 'income' ? "text-green-500" : "text-white"
                  )}>
                    {t.type === 'income' ? '+' : '-'}Rp {t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(t)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(t.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredTransactions.map((t) => (
            <div key={t.id} className="p-4 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleSelect(t.id)} className="text-white/20 hover:text-white transition-colors">
                  {selectedIds.includes(t.id) ? (
                    <CheckSquare className="w-5 h-5 text-neon" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <div className="flex flex-col">
                  <div className="font-bold text-sm flex items-center gap-2">
                    {t.name}
                    {t.receiptUrl && <ImageIcon className="w-3 h-3 text-neon" />}
                  </div>
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                    {t.date} • {t.category}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={cn("text-sm font-black", t.type === 'income' ? "text-green-500" : "text-white")}>
                  {t.type === 'income' ? '+' : '-'}Rp {t.amount.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(t)} className="p-1.5 text-white/20 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openDeleteModal(t.id)} className="p-1.5 text-white/20 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="px-6 py-20 text-center text-white/20 font-bold">
            Tidak ada transaksi ditemukan.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-lighter w-full max-w-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-black">{editingTransaction ? 'Edit Transaksi' : 'Catat Transaksi Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex bg-white/5 p-1 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-black transition-all",
                    formData.type === 'expense' ? "bg-white text-dark" : "text-white/40 hover:text-white"
                  )}
                >
                  Pengeluaran
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-black transition-all",
                    formData.type === 'income' ? "bg-green-500 text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  Pemasukan
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/20 uppercase tracking-widest">Nama Transaksi</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Kopi Pagi, Gaji, dll"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neon/10 text-neon rounded-xl flex items-center justify-center">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Split Transaction</div>
                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Bagi ke beberapa kategori</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setIsSplitMode(!isSplitMode);
                    if (!isSplitMode && formData.splits.length === 0) {
                      setFormData({ ...formData, splits: [{ category: formData.category, amount: parseFloat(formData.amount) || 0 }] });
                    }
                  }}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    isSplitMode ? "bg-neon" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all",
                    isSplitMode ? "right-1 bg-dark" : "left-1 bg-white/40"
                  )} />
                </button>
              </div>

              {!isSplitMode ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-white/20 uppercase tracking-widest">Jumlah (Rp)</label>
                      <input 
                        required
                        type="number" 
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-white/20 uppercase tracking-widest">Kategori</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors appearance-none"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-dark text-white">{c}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-white/20 uppercase tracking-widest">Daftar Split</label>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, splits: [...formData.splits, { category: 'Others', amount: 0 }] })}
                      className="text-neon text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      + Tambah Item
                    </button>
                  </div>
                  {formData.splits.map((split, index) => (
                    <div key={index} className="flex gap-2 items-end bg-white/5 p-3 rounded-2xl border border-white/5">
                      <div className="flex-1 space-y-1">
                        <select 
                          value={split.category}
                          onChange={(e) => {
                            const newSplits = [...formData.splits];
                            newSplits[index].category = e.target.value;
                            setFormData({ ...formData, splits: newSplits });
                          }}
                          className="w-full bg-transparent text-xs font-bold focus:outline-none"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c} className="bg-dark">{c}</option>)}
                        </select>
                        <input 
                          type="number"
                          value={split.amount}
                          onChange={(e) => {
                            const newSplits = [...formData.splits];
                            newSplits[index].amount = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, splits: newSplits });
                          }}
                          className="w-full bg-transparent text-sm font-black focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, splits: formData.splits.filter((_, i) => i !== index) })}
                        className="p-2 text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 bg-neon/10 rounded-2xl border border-neon/20">
                    <span className="text-[10px] font-black text-neon uppercase tracking-widest">Total Split</span>
                    <span className="text-sm font-black text-neon">Rp {formData.splits.reduce((acc, s) => acc + s.amount, 0).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/20 uppercase tracking-widest">Tanggal</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/20 uppercase tracking-widest">Dompet</label>
                  <select 
                    required
                    value={formData.wallet_id}
                    onChange={(e) => setFormData({ ...formData, wallet_id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors appearance-none"
                  >
                    <option value="" className="bg-dark text-white">Pilih Dompet</option>
                    {wallets.map(w => <option key={w.id} value={w.id} className="bg-dark text-white">{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-white/20 uppercase tracking-widest">Lampiran Struk (Simulasi)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={formData.receiptUrl}
                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                    placeholder="URL Gambar Struk"
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, receiptUrl: 'https://picsum.photos/seed/receipt/400/600' })}
                    className="bg-white/5 px-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-white/40" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Transaksi Berulang</div>
                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Otomatis setiap bulan</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.isRecurring ? "bg-neon" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all",
                    formData.isRecurring ? "right-1 bg-dark" : "left-1 bg-white/40"
                  )} />
                </button>
              </div>

              <button 
                type="submit"
                className={cn(
                  "w-full py-4 rounded-2xl font-black transition-all mt-4",
                  formData.type === 'income' ? "bg-green-500 text-white hover:bg-green-600" : "bg-neon text-dark hover:bg-neon-dark"
                )}
              >
                {editingTransaction ? 'Simpan Perubahan' : 'Catat Transaksi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-lighter w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-2">Hapus Transaksi?</h3>
            <p className="text-white/60 text-sm mb-8">
              Tindakan ini tidak dapat dibatalkan. Saldo dompet kamu akan disesuaikan kembali.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-2xl font-bold transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </PageLayout>
  );
}
