import PageLayout from '@/src/components/PageLayout';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Pencil, 
  Trash2, 
  X, 
  ChevronRight, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { Input, Select } from '@/src/components/ui/Input';
import { dbService } from '@/src/services/dbService';
import { useAuth } from '@/src/lib/AuthContext';
import { Loader2 } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  target: number;
  isCompleted: boolean;
}

interface Contribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  milestones: Milestone[];
  history: Contribution[];
}

const COLORS = [
  { name: 'Neon', value: 'bg-neon' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

const CATEGORIES = ['Travel', 'Gadget', 'Emergency Fund', 'Vehicle', 'House', 'Education', 'Other'];

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalData, walletData] = await Promise.all([
        dbService.getGoals(),
        dbService.getWallets()
      ]);
      
      const mapped = goalData.map((g: any) => ({
        ...g,
        current: g.current_amount || 0,
        target: g.target_amount || 0,
        milestones: g.milestones || [],
        history: g.history || []
      }));
      setGoals(mapped);
      setWallets(walletData);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data goals');
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addFundsWalletId, setAddFundsWalletId] = useState('');
  const [addFundsNote, setAddFundsNote] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    target: '',
    current: '',
    deadline: '',
    color: 'bg-neon',
    category: 'Travel',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  const stats = useMemo(() => {
    const totalTarget = goals.reduce((acc, curr) => acc + curr.target, 0);
    const totalCurrent = goals.reduce((acc, curr) => acc + curr.current, 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    const completedGoals = goals.filter(g => g.current >= g.target).length;
    return { totalTarget, totalCurrent, overallProgress, completedGoals };
  }, [goals]);

  const openAddModal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      target: '',
      current: '',
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      color: 'bg-neon',
      category: 'Travel',
      priority: 'Medium'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (g: Goal) => {
    setEditingGoal(g);
    setFormData({
      title: g.title,
      target: g.target.toString(),
      current: g.current.toString(),
      deadline: g.deadline,
      color: g.color,
      category: g.category,
      priority: g.priority
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setGoalToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: formData.title,
      target_amount: parseFloat(formData.target) || 0,
      current: parseFloat(formData.current) || 0,
      deadline: formData.deadline,
      color: formData.color,
      category: formData.category,
      priority: formData.priority,
    };

    try {
      if (editingGoal) {
        const updated = await dbService.updateGoal(editingGoal.id, data);
        setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...updated, target: updated.target_amount } : g));
      } else {
        const created = await dbService.createGoal(data);
        setGoals([...goals, { ...created, target: created.target_amount, milestones: [], history: [] }]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan goal: ' + err.message);
    }
  };

  const confirmDelete = async () => {
    if (goalToDelete) {
      try {
        await dbService.deleteGoal(goalToDelete);
        setGoals(goals.filter(g => g.id !== goalToDelete));
        setIsDeleteModalOpen(false);
        setGoalToDelete(null);
      } catch (err: any) {
        alert('Gagal menghapus goal: ' + err.message);
      }
    }
  };

  const openAddFundsModal = (g: Goal) => {
    setSelectedGoal(g);
    setAddFundsAmount('');
    setAddFundsNote('');
    setIsAddFundsModalOpen(true);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoal && addFundsAmount && addFundsWalletId) {
      try {
        const amount = parseFloat(addFundsAmount);
        const newCurrent = selectedGoal.current + amount;

        // Update goal in DB
        await dbService.updateGoal(selectedGoal.id, { current_amount: newCurrent });

        // Create a transaction for this contribution
        await dbService.createTransaction({
          name: `Tabungan: ${selectedGoal.title || selectedGoal.name}`,
          category: 'Savings',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          wallet_id: addFundsWalletId,
          type: 'expense',
          note: addFundsNote || `Kontribusi untuk goal: ${selectedGoal.title || selectedGoal.name}`
        });

        const newContribution = {
          id: Math.random().toString(36).substr(2, 9),
          amount,
          date: new Date().toISOString().split('T')[0],
          note: addFundsNote
        };

        setGoals(goals.map(g => {
          if (g.id === selectedGoal.id) {
            // Auto-complete milestones
            const updatedMilestones = g.milestones.map((m: any) => ({
              ...m,
              isCompleted: m.isCompleted || newCurrent >= m.target
            }));
            return { 
              ...g, 
              current: newCurrent, 
              history: [newContribution, ...g.history],
              milestones: updatedMilestones
            };
          }
          return g;
        }));
        setIsAddFundsModalOpen(false);
        setSelectedGoal(null);
        setAddFundsAmount('');
        setAddFundsWalletId('');
        setAddFundsNote('');
      } catch (err: any) {
        alert('Gagal menambah dana: ' + err.message);
      }
    }
  };

  const openDetailModal = (g: Goal) => {
    setSelectedGoal(g);
    setIsDetailModalOpen(true);
  };

  const calculateMonthlySaving = (target: number, current: number, deadline: string) => {
    const remaining = target - current;
    if (remaining <= 0) return 0;
    
    const now = new Date();
    const targetDate = new Date(deadline);
    const diffTime = targetDate.getTime() - now.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    return diffMonths > 0 ? Math.ceil(remaining / diffMonths) : remaining;
  };

  return (
    <PageLayout 
      title="Goals" 
      description="Wujudkan impianmu dengan menabung secara teratur."
      actions={
        <Button 
          variant="neon"
          onClick={openAddModal}
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Goal</span>
          <span className="sm:hidden">Goal Baru</span>
        </Button>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-neon animate-spin mb-4" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Memuat data goals...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white/60 font-bold mb-4">{error}</p>
          <Button variant="primary" onClick={fetchData}>Coba Lagi</Button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <Card className="p-5 sm:p-6">
          <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-glow-neon">Total Terkumpul</div>
          <div className="text-xl sm:text-2xl font-black mb-1 tracking-tight">Rp {stats.totalCurrent.toLocaleString()}</div>
          <div className="text-[10px] sm:text-xs text-neon font-black uppercase tracking-wider">Dari target Rp {stats.totalTarget.toLocaleString()}</div>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-glow-neon">Progress Keseluruhan</div>
          <div className="text-xl sm:text-2xl font-black mb-2 tracking-tight">{stats.overallProgress.toFixed(1)}%</div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-neon rounded-full" style={{ width: `${stats.overallProgress}%` }} />
          </div>
        </Card>
        <Card className="p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-glow-neon">Goal Tercapai</div>
          <div className="text-xl sm:text-2xl font-black mb-1 tracking-tight">{stats.completedGoals} <span className="text-sm text-white/40">Goals</span></div>
          <div className="text-[10px] sm:text-xs text-white/40 font-black uppercase tracking-wider">Dari total {goals.length} impian</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {goals.map((g) => {
          const percent = Math.min((g.current / g.target) * 100, 100);
          const monthly = calculateMonthlySaving(g.target, g.current, g.deadline);
          const isCompleted = percent >= 100;

          return (
            <Card key={g.id} className="p-6 sm:p-8 flex flex-col group relative overflow-hidden active:scale-[0.98] sm:active:scale-100 transition-all">
              {/* Actions */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => openEditModal(g)}
                  className="p-1.5 sm:p-2 min-w-0"
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Button 
                  variant="danger"
                  size="sm"
                  onClick={() => openDeleteModal(g.id)}
                  className="p-1.5 sm:p-2 min-w-0"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-start mb-8">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-dark", g.color)}>
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Deadline</div>
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <Calendar className="w-3 h-3" />
                    {new Date(g.deadline).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 px-2 py-1 bg-white/5 rounded-md">
                  {g.category}
                </span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                  g.priority === 'High' ? "bg-red-500/10 text-red-500" :
                  g.priority === 'Medium' ? "bg-orange-500/10 text-orange-500" :
                  "bg-blue-500/10 text-blue-500"
                )}>
                  {g.priority} Priority
                </span>
              </div>
              <h3 className="text-xl font-black mb-6">{g.title}</h3>
              
              <div className="flex-1 mb-8">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-3xl font-black">Rp {g.current.toLocaleString()}</div>
                  <div className="text-white/40 text-sm">/ Rp {g.target.toLocaleString()}</div>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-4">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", g.color)} 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                
                {!isCompleted && monthly > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <Clock className="w-4 h-4 text-neon" />
                    <div className="text-[11px]">
                      <span className="text-white/40 block">Saran Tabungan Bulanan</span>
                      <span className="font-black">Rp {monthly.toLocaleString()} / bln</span>
                    </div>
                  </div>
                )}
                {isCompleted && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div className="text-[11px]">
                      <span className="text-green-500 font-black">Goal Tercapai!</span>
                      <span className="text-white/40 block">Selamat, impianmu sudah terwujud.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className={cn(
                  "flex items-center gap-2 text-xs font-bold",
                  isCompleted ? "text-green-500" : "text-neon"
                )}>
                  <TrendingUp className="w-4 h-4" />
                  {percent.toFixed(0)}% Selesai
                </div>
                <div className="flex items-center gap-2">
                  {!isCompleted && (
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => openAddFundsModal(g)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tabung
                    </Button>
                  )}
                  <Button 
                    variant="ghost"
                    onClick={() => openDetailModal(g)}
                    className="text-white/40 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 p-0 min-w-0"
                  >
                    Detail <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
        {goals.length === 0 && (
          <Card className="col-span-full text-center py-20">
            <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/20 font-black uppercase tracking-widest">Belum ada impian yang dicatat</p>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Tambah Goal Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Nama Impian"
            required
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Misal: Liburan ke Jepang, Beli Rumah"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Target Dana (Rp)"
              required
              type="number" 
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              placeholder="0"
            />
            <Input 
              label="Dana Terkumpul (Rp)"
              required
              type="number" 
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES.map(c => ({ label: c, value: c }))}
            />
            <Select 
              label="Prioritas"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              options={[
                { label: 'Low', value: 'Low' },
                { label: 'Medium', value: 'Medium' },
                { label: 'High', value: 'High' }
              ]}
            />
          </div>

          <Input 
            label="Deadline"
            required
            type="date" 
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />

          <div className="space-y-2">
            <label className="text-xs font-black text-white/20 uppercase tracking-widest">Warna Tema</label>
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

          <Button 
            type="submit"
            variant="neon"
            className="w-full py-4"
          >
            {editingGoal ? 'Simpan Perubahan' : 'Buat Goal'}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Goal?"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm mb-8">
            Tindakan ini akan menghapus target impian kamu. Data tabungan yang sudah ada tidak akan hilang dari dompet.
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

      {/* Add Funds Modal */}
      <Modal
        isOpen={isAddFundsModalOpen}
        onClose={() => setIsAddFundsModalOpen(false)}
        title="Tambah Tabungan"
        maxWidth="max-w-sm"
      >
        {selectedGoal && (
          <form onSubmit={handleAddFunds} className="space-y-6">
            <div className="text-center mb-4">
              <div className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">Goal</div>
              <div className="text-lg font-bold">{selectedGoal.title}</div>
            </div>

            <Input 
              label="Jumlah Tabungan (Rp)"
              required
              autoFocus
              type="number" 
              value={addFundsAmount}
              onChange={(e) => setAddFundsAmount(e.target.value)}
              placeholder="0"
              className="py-4 text-center text-2xl font-black"
            />

            <Select 
              label="Ambil dari Dompet"
              required
              value={addFundsWalletId}
              onChange={(e) => setAddFundsWalletId(e.target.value)}
              options={[
                { label: 'Pilih Dompet', value: '' },
                ...wallets.map(w => ({ label: `${w.name} (Rp ${w.balance.toLocaleString()})`, value: w.id }))
              ]}
            />

            <Input 
              label="Catatan (Opsional)"
              type="text" 
              value={addFundsNote}
              onChange={(e) => setAddFundsNote(e.target.value)}
              placeholder="Misal: Bonus lembur"
            />

            <Button 
              type="submit"
              variant="neon"
              className="w-full py-4"
            >
              Konfirmasi Tabungan
            </Button>
          </form>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedGoal?.title || 'Detail Goal'}
        maxWidth="max-w-2xl"
      >
        {selectedGoal && (
          <div className="space-y-8">
            {/* Progress Overview */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Terkumpul</div>
                <div className="text-2xl font-black">Rp {selectedGoal.current.toLocaleString()}</div>
                <div className="text-xs text-white/40 mt-1">Target: Rp {selectedGoal.target.toLocaleString()}</div>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Sisa Waktu</div>
                <div className="text-2xl font-black">
                  {Math.ceil((new Date(selectedGoal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 
                  <span className="text-sm text-white/40 ml-1">Hari</span>
                </div>
                <div className="text-xs text-white/40 mt-1">Hingga {new Date(selectedGoal.deadline).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Milestones</h4>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    const title = window.prompt('Nama Milestone:');
                    const target = window.prompt('Target Dana (Rp):');
                    if (title && target) {
                      setGoals(goals.map(g => g.id === selectedGoal.id ? {
                        ...g,
                        milestones: [...g.milestones, { id: Math.random().toString(36).substr(2, 9), title, target: parseFloat(target), isCompleted: g.current >= parseFloat(target) }]
                      } : g));
                      // Update local selectedGoal too
                      setSelectedGoal({
                        ...selectedGoal,
                        milestones: [...selectedGoal.milestones, { id: Math.random().toString(36).substr(2, 9), title, target: parseFloat(target), isCompleted: selectedGoal.current >= parseFloat(target) }]
                      });
                    }
                  }}
                  className="text-neon text-[10px] font-black uppercase tracking-widest hover:underline p-0 min-w-0"
                >
                  + Tambah Milestone
                </Button>
              </div>
              <div className="space-y-2">
                {selectedGoal.milestones.length > 0 ? selectedGoal.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      {m.isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-white/10" />}
                      <div>
                        <div className={cn("text-sm font-bold", m.isCompleted && "text-white/40 line-through")}>{m.title}</div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Rp {m.target.toLocaleString()}</div>
                      </div>
                    </div>
                    {!m.isCompleted && (
                      <div className="text-[10px] font-black text-neon uppercase tracking-widest">
                        Kurang Rp {(m.target - selectedGoal.current).toLocaleString()}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-6 text-white/20 text-xs font-bold bg-white/5 rounded-2xl border border-white/5 border-dashed">
                    Belum ada milestone.
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Riwayat Tabungan</h4>
              <div className="space-y-2">
                {selectedGoal.history.length > 0 ? selectedGoal.history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">Rp {h.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">{h.date} {h.note && `• ${h.note}`}</div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-white/20 text-xs font-bold bg-white/5 rounded-2xl border border-white/5 border-dashed">
                    Belum ada riwayat tabungan.
                  </div>
                )}
              </div>
            </div>

            <Button 
              variant="neon"
              onClick={() => {
                setIsDetailModalOpen(false);
                openAddFundsModal(selectedGoal);
              }}
              className="w-full py-4"
            >
              Tabung Sekarang
            </Button>
          </div>
        )}
      </Modal>
      </>
      )}
    </PageLayout>
  );
}
