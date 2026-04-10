import PageLayout from '@/src/components/PageLayout';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  Settings2, 
  Plus, 
  Pencil, 
  Trash2, 
  X,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { Input, Select } from '@/src/components/ui/Input';
import { dbService } from '@/src/services/dbService';
import { useAuth } from '@/src/lib/AuthContext';
import { Loader2 } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
  lastMonthSpent: number;
  type: 'needs' | 'wants' | 'savings';
  isRollover?: boolean;
  alertThreshold?: number; // percentage
  history: number[]; // last 6 months spent
}

const COLORS = [
  { name: 'Neon', value: 'bg-neon', hex: '#d4ff00' },
  { name: 'Blue', value: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Purple', value: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Orange', value: 'bg-orange-500', hex: '#f97316' },
  { name: 'Red', value: 'bg-red-500', hex: '#ef4444' },
  { name: 'Cyan', value: 'bg-cyan-500', hex: '#06b6d4' },
];

const CATEGORIES = [
  { name: 'Makan & Minum', type: 'needs' },
  { name: 'Transportasi', type: 'needs' },
  { name: 'Hiburan', type: 'wants' },
  { name: 'Belanja', type: 'wants' },
  { name: 'Kesehatan', type: 'needs' },
  { name: 'Tagihan', type: 'needs' },
  { name: 'Pendidikan', type: 'needs' },
  { name: 'Tabungan', type: 'savings' },
  { name: 'Lainnya', type: 'wants' }
];

export default function BudgetPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const [budgetData, transData] = await Promise.all([
        dbService.getBudgets(),
        dbService.getTransactions()
      ]);

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const mapped = budgetData.map((b: any) => {
        // Calculate spent for this category in current month
        const spent = transData
          .filter(t => t.category === b.category && t.type === 'expense' && new Date(t.date) >= firstDay)
          .reduce((acc, t) => acc + t.amount, 0);

        return {
          ...b,
          spent: spent,
          lastMonthSpent: b.last_month_spent || 0,
          history: b.history || [0, 0, 0, 0, 0, 0],
          alertThreshold: b.alert_threshold || 80,
          isRollover: b.is_rollover || false,
          limit: b.amount // Aligning field names
        };
      });
      setBudgets(mapped);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data budget');
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isReallocateModalOpen, setIsReallocateModalOpen] = useState(false);
  const [reallocationSuggestions, setReallocationSuggestions] = useState<{fromId: string, toId: string, amount: number}[]>([]);

  const [formData, setFormData] = useState({
    category: 'Makan & Minum',
    limit: '',
    color: 'bg-neon',
    type: 'needs' as 'needs' | 'wants' | 'savings',
    isRollover: false,
    alertThreshold: 80
  });

  const stats = useMemo(() => {
    const totalLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
    const percent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

    // 50/30/20 Analysis
    const needs = budgets.filter(b => b.type === 'needs').reduce((acc, curr) => acc + curr.limit, 0);
    const wants = budgets.filter(b => b.type === 'wants').reduce((acc, curr) => acc + curr.limit, 0);
    const savings = budgets.filter(b => b.type === 'savings').reduce((acc, curr) => acc + curr.limit, 0);

    const needsPercent = totalLimit > 0 ? (needs / totalLimit) * 100 : 0;
    const wantsPercent = totalLimit > 0 ? (wants / totalLimit) * 100 : 0;
    const savingsPercent = totalLimit > 0 ? (savings / totalLimit) * 100 : 0;

    // Chart data
    const chartData = budgets.map(b => ({
      name: b.category,
      value: b.limit,
      color: COLORS.find(c => c.value === b.color)?.hex || '#d4ff00'
    }));

    return { 
      totalLimit, 
      totalSpent, 
      percent, 
      needsPercent, 
      wantsPercent, 
      savingsPercent,
      chartData 
    };
  }, [budgets]);

  const openAddModal = () => {
    setEditingBudget(null);
    setFormData({ 
      category: 'Makan & Minum', 
      limit: '', 
      color: 'bg-neon', 
      type: 'needs',
      isRollover: false,
      alertThreshold: 80
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setFormData({
      category: b.category,
      limit: b.limit.toString(),
      color: b.color,
      type: b.type,
      isRollover: b.isRollover || false,
      alertThreshold: b.alertThreshold || 80
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setBudgetToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      category: formData.category,
      amount: parseFloat(formData.limit) || 0,
      color: formData.color,
      type: formData.type,
      is_rollover: formData.isRollover,
      alert_threshold: formData.alertThreshold,
    };

    try {
      if (editingBudget) {
        const updated = await dbService.updateBudget(editingBudget.id, data);
        setBudgets(budgets.map(b => b.id === editingBudget.id ? { ...b, ...updated, limit: updated.amount } : b));
      } else {
        const created = await dbService.createBudget(data);
        setBudgets([...budgets, { ...created, limit: created.amount, spent: 0, history: [0, 0, 0, 0, 0, 0] }]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan budget: ' + err.message);
    }
  };

  const confirmDelete = async () => {
    if (budgetToDelete) {
      try {
        await dbService.deleteBudget(budgetToDelete);
        setBudgets(budgets.filter(b => b.id !== budgetToDelete));
        setIsDeleteModalOpen(false);
        setBudgetToDelete(null);
      } catch (err: any) {
        alert('Gagal menghapus budget: ' + err.message);
      }
    }
  };

  const generateReallocation = () => {
    const savers = budgets.filter(b => (b.limit - b.spent) > (b.limit * 0.4)); // Categories with >40% remaining
    const spenders = budgets.filter(b => (b.spent / b.limit) > 0.85); // Categories with >85% spent

    if (savers.length === 0 || spenders.length === 0) {
      alert("Belum ada data yang cukup untuk melakukan realokasi otomatis.");
      return;
    }

    const suggestions: {fromId: string, toId: string, amount: number}[] = [];
    
    spenders.forEach(spender => {
      const needed = spender.limit * 0.2; // Suggest adding 20% more limit
      let collected = 0;

      for (const saver of savers) {
        if (collected >= needed) break;
        const available = (saver.limit - saver.spent) * 0.3; // Take 30% of their surplus
        const take = Math.min(available, needed - collected);
        
        if (take > 50000) { // Only suggest if > 50k
          suggestions.push({ fromId: saver.id, toId: spender.id, amount: Math.round(take / 1000) * 1000 });
          collected += take;
        }
      }
    });

    setReallocationSuggestions(suggestions);
    setIsReallocateModalOpen(true);
  };

  const applyReallocation = () => {
    let newBudgets = [...budgets];
    reallocationSuggestions.forEach(s => {
      newBudgets = newBudgets.map(b => {
        if (b.id === s.fromId) return { ...b, limit: b.limit - s.amount };
        if (b.id === s.toId) return { ...b, limit: b.limit + s.amount };
        return b;
      });
    });
    setBudgets(newBudgets);
    setIsReallocateModalOpen(false);
  };

  return (
    <PageLayout 
      title="Budget" 
      description="Atur batasan pengeluaran untuk setiap kategori."
      actions={
        <Button 
          variant="neon"
          onClick={openAddModal}
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Tambah Budget
        </Button>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-neon animate-spin mb-4" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Memuat data budget...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white/60 font-bold mb-4">{error}</p>
          <Button variant="primary" onClick={fetchBudgets}>Coba Lagi</Button>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {budgets.map((b) => {
            const percent = (b.spent / b.limit) * 100;
            const isWarning = percent >= (b.alertThreshold || 90);
            const avgSpent = b.history.reduce((a, b) => a + b, 0) / b.history.length;
            const isAboveAvg = b.spent > avgSpent;

            return (
              <Card key={b.id} className="p-4 sm:p-6 group relative transition-all hover:border-white/10">
                <div className="absolute top-4 right-4 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="primary"
                    size="sm"
                    onClick={() => openEditModal(b)}
                    className="p-1.5 sm:p-2 min-w-0"
                  >
                    <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button 
                    variant="danger"
                    size="sm"
                    onClick={() => openDeleteModal(b.id)}
                    className="p-1.5 sm:p-2 min-w-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-start mb-4 pr-16 sm:pr-0">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white", b.color)}>
                      <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg leading-none mb-1">{b.category}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] sm:text-[10px] text-white/20 uppercase font-black tracking-widest">{b.type}</span>
                        {b.isRollover && (
                          <span className="text-[7px] sm:text-[8px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Rollover</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-black text-lg sm:text-xl">Rp {b.spent.toLocaleString()}</span>
                    </div>
                    <span className="text-white/40 text-[10px] sm:text-xs font-bold"> / Rp {b.limit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", b.color)} 
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center sm:items-center">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex flex-col">
                      <span className={cn("text-[9px] sm:text-[10px] font-black uppercase tracking-widest", isWarning ? "text-orange-500" : "text-white/20")}>
                        {percent.toFixed(0)}% Terpakai
                      </span>
                      <span className="hidden sm:inline text-[9px] text-white/40 font-bold">Threshold: {b.alertThreshold}%</span>
                    </div>
                    <div className="hidden sm:block h-6 w-px bg-white/5" />
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20">Trend</span>
                      <div className="flex items-center gap-1">
                        {isAboveAvg ? (
                          <ArrowUpRight className="w-3 h-3 text-red-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-green-500" />
                        )}
                        <span className={cn("text-[9px] font-bold", isAboveAvg ? "text-red-500" : "text-green-500")}>
                          {isAboveAvg ? 'Up' : 'Down'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20">Sisa</div>
                    <div className="text-xs sm:text-sm font-black text-white/60">Rp {Math.max(0, b.limit - b.spent).toLocaleString()}</div>
                  </div>
                </div>

                {isWarning && (
                  <div className="mt-4 p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center gap-3 animate-pulse">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <p className="text-[10px] text-orange-200/80 font-bold">
                      Hampir melewati batas! Kamu sudah menggunakan {percent.toFixed(0)}% dari budget {b.category}.
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
          {budgets.length === 0 && (
            <Card className="text-center py-20">
              <p className="text-white/20 font-black uppercase tracking-widest">Belum ada budget yang diatur</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-8 relative overflow-hidden">
            <h3 className="text-xl font-black mb-6">Alokasi Budget</h3>
            <div className="h-48 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.chartData.map((entry, index) => (
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-xs font-bold">Total Limit</span>
                <span className="text-xl font-black">Rp {stats.totalLimit.toLocaleString()}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon rounded-full" 
                  style={{ width: `${Math.min(stats.percent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                <span>Terpakai {stats.percent.toFixed(1)}%</span>
                <span>Sisa Rp {Math.max(0, stats.totalLimit - stats.totalSpent).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Aturan 50/30/20
              </h3>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Analisis</div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/60">Needs (Kebutuhan)</span>
                  <span className={cn(stats.needsPercent > 50 ? "text-red-500" : "text-white")}>
                    {stats.needsPercent.toFixed(0)}% / 50%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-neon rounded-full" style={{ width: `${Math.min(stats.needsPercent * 2, 100)}%` }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/60">Wants (Keinginan)</span>
                  <span className={cn(stats.wantsPercent > 30 ? "text-red-500" : "text-white")}>
                    {stats.wantsPercent.toFixed(0)}% / 30%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(stats.wantsPercent * 3.33, 100)}%` }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/60">Savings (Tabungan)</span>
                  <span className={cn(stats.savingsPercent < 20 ? "text-orange-500" : "text-green-500")}>
                    {stats.savingsPercent.toFixed(0)}% / 20%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(stats.savingsPercent * 5, 100)}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon" />
              Saran AI
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-white/60 leading-relaxed">
                {stats.percent > 80 
                  ? "Pengeluaran total kamu sudah mencapai 80% dari budget. Pertimbangkan untuk menunda belanja non-esensial sampai bulan depan."
                  : "Keuangan kamu terlihat sehat! Kamu masih punya sisa budget yang cukup untuk ditabung atau diinvestasikan."}
              </p>
              
              <Button 
                variant="primary"
                onClick={generateReallocation}
                className="w-full py-3 text-neon text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Settings2 className="w-4 h-4" />
                Auto-Reallocate Budget
              </Button>

              {stats.needsPercent > 50 && (
                <div className="flex gap-3 p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-[11px] text-red-200/80">
                    Alokasi <b>Needs</b> kamu melebihi 50%. Coba tinjau kembali tagihan bulanan atau biaya transportasi kamu.
                  </p>
                </div>
              )}
              {stats.savingsPercent < 20 && (
                <div className="flex gap-3 p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                  <TrendingDown className="w-5 h-5 text-orange-500 shrink-0" />
                  <p className="text-[11px] text-orange-200/80">
                    Alokasi <b>Savings</b> kamu di bawah 20%. Tingkatkan tabungan untuk mencapai kebebasan finansial lebih cepat.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Budget' : 'Tambah Budget Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select 
            label="Kategori"
            value={formData.category}
            onChange={(e) => {
              const cat = CATEGORIES.find(c => c.name === e.target.value);
              setFormData({ ...formData, category: e.target.value, type: cat?.type || 'wants' });
            }}
            options={CATEGORIES.map(c => ({ label: c.name, value: c.name }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Limit Bulanan (Rp)"
              required
              type="number" 
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              placeholder="0"
            />
            <Select 
              label="Tipe Budget"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { label: 'Needs (50%)', value: 'needs' },
                { label: 'Wants (30%)', value: 'wants' },
                { label: 'Savings (20%)', value: 'savings' }
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-white/20 uppercase tracking-widest">Warna Label</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <Button
                  key={c.value}
                  type="button"
                  variant="ghost"
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all p-0 min-w-0",
                    c.value,
                    formData.color === c.value ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-bold">Rollover</span>
                <span className="text-[8px] text-white/40 font-black uppercase tracking-widest">Sisa ke bulan depan</span>
              </div>
              <Button 
                type="button"
                variant="ghost"
                onClick={() => setFormData({ ...formData, isRollover: !formData.isRollover })}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative p-0 min-w-0",
                  formData.isRollover ? "bg-neon" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full transition-all",
                  formData.isRollover ? "right-1 bg-dark" : "left-1 bg-white/40"
                )} />
              </Button>
            </div>
            <div className="space-y-1 p-4 bg-white/5 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Alert Threshold</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  step="5"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                  className="flex-1 accent-neon"
                />
                <span className="text-xs font-bold text-neon">{formData.alertThreshold}%</span>
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            variant="neon"
            className="w-full py-4"
          >
            {editingBudget ? 'Simpan Perubahan' : 'Buat Budget'}
          </Button>
        </form>
      </Modal>

      {/* Reallocate Modal */}
      <Modal
        isOpen={isReallocateModalOpen}
        onClose={() => setIsReallocateModalOpen(false)}
        title="Smart Reallocation"
      >
        <div className="space-y-6">
          <p className="text-sm text-white/60 leading-relaxed">
            AI telah menganalisis pengeluaran kamu. Berikut adalah saran untuk memindahkan sisa budget dari kategori yang hemat ke kategori yang hampir habis.
          </p>

          <div className="space-y-3">
            {reallocationSuggestions.map((s, i) => {
              const from = budgets.find(b => b.id === s.fromId);
              const to = budgets.find(b => b.id === s.toId);
              return (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Dari</span>
                    <span className="text-sm font-bold">{from?.category}</span>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <ArrowUpRight className="w-4 h-4 text-neon mb-1 rotate-90" />
                    <span className="text-xs font-black text-neon">Rp {s.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Ke</span>
                    <span className="text-sm font-bold">{to?.category}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-200/80">
              Total limit budget kamu tetap sama. AI hanya memindahkan alokasi agar kamu tidak <i>overbudget</i> di kategori tertentu.
            </p>
          </div>

          <Button 
            variant="neon"
            onClick={applyReallocation}
            className="w-full py-4"
          >
            Terapkan Realokasi
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Budget?"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm mb-8">
            Tindakan ini akan menghapus batasan pengeluaran untuk kategori ini.
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
