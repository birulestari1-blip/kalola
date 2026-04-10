import PageLayout from '@/src/components/PageLayout';
import { 
  Plus, 
  Wallet as WalletIcon, 
  CreditCard, 
  Smartphone, 
  Pencil, 
  Trash2, 
  X, 
  ArrowRightLeft, 
  Eye, 
  EyeOff, 
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowRight
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { Input, Select } from '@/src/components/ui/Input';
import { dbService, Wallet } from '@/src/services/dbService';
import { useAuth } from '@/src/lib/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';

const WALLET_TYPES = ['Bank', 'E-Wallet', 'Digital Bank', 'Cash', 'Credit Card', 'PayLater'];
const COLORS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Neon', value: 'bg-neon text-dark' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Green', value: 'bg-green-500' },
];

export default function DompetPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await dbService.getWallets();
      setWallets(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data dompet');
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bank',
    balance: '',
    targetBalance: '',
    color: 'bg-blue-500',
    accountNumber: '',
    accountHolder: ''
  });

  const [adjustmentData, setAdjustmentData] = useState({
    type: 'interest' as 'interest' | 'fee',
    amount: '',
    walletId: ''
  });

  // Mock transactions for history
  const mockTransactions = [
    { id: '1', name: 'Starbucks Coffee', amount: 55000, date: '2026-04-08', type: 'expense', wallet: 'BCA Main' },
    { id: '2', name: 'Gaji April', amount: 8500000, date: '2026-04-07', type: 'income', wallet: 'Mandiri Savings' },
    { id: '3', name: 'Indomaret Point', amount: 124500, date: '2026-04-07', type: 'expense', wallet: 'GoPay' },
    { id: '4', name: 'Netflix Subscription', amount: 186000, date: '2026-04-06', type: 'expense', wallet: 'Jenius' },
    { id: '5', name: 'Transfer from Mom', amount: 500000, date: '2026-04-05', type: 'income', wallet: 'GoPay' },
  ];

  const filteredHistory = useMemo(() => {
    if (!selectedWallet) return [];
    return mockTransactions.filter(t => t.wallet === selectedWallet.name);
  }, [selectedWallet]);

  const [transferData, setTransferData] = useState({
    fromId: '',
    toId: '',
    amount: ''
  });

  const totalBalance = useMemo(() => wallets.reduce((acc, w) => acc + w.balance, 0), [wallets]);

  const chartData = useMemo(() => {
    return wallets.map(w => ({
      name: w.name,
      value: w.balance,
      color: w.color.includes('bg-neon') ? '#ccff00' : 
             w.color.includes('bg-blue') ? '#3b82f6' :
             w.color.includes('bg-yellow') ? '#eab308' :
             w.color.includes('bg-cyan') ? '#06b6d4' :
             w.color.includes('bg-purple') ? '#a855f7' :
             w.color.includes('bg-red') ? '#ef4444' : '#22c55e'
    }));
  }, [wallets]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferData.amount);
    if (!amount || !transferData.fromId || !transferData.toId || transferData.fromId === transferData.toId) return;

    try {
      const fromWallet = wallets.find(w => w.id === transferData.fromId);
      const toWallet = wallets.find(w => w.id === transferData.toId);

      if (!fromWallet || !toWallet) return;

      await Promise.all([
        dbService.updateWallet(fromWallet.id, { balance: fromWallet.balance - amount }),
        dbService.updateWallet(toWallet.id, { balance: toWallet.balance + amount })
      ]);

      setWallets(prev => prev.map(w => {
        if (w.id === transferData.fromId) return { ...w, balance: w.balance - amount };
        if (w.id === transferData.toId) return { ...w, balance: w.balance + amount };
        return w;
      }));
      setIsTransferModalOpen(false);
      setTransferData({ fromId: '', toId: '', amount: '' });
    } catch (err: any) {
      alert('Gagal melakukan transfer: ' + err.message);
    }
  };

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(adjustmentData.amount);
    if (!amount || !adjustmentData.walletId) return;

    try {
      const wallet = wallets.find(w => w.id === adjustmentData.walletId);
      if (!wallet) return;

      const newBalance = adjustmentData.type === 'interest' ? wallet.balance + amount : wallet.balance - amount;
      
      await dbService.updateWallet(wallet.id, { balance: newBalance });

      setWallets(prev => prev.map(w => {
        if (w.id === adjustmentData.walletId) {
          return { ...w, balance: newBalance };
        }
        return w;
      }));
      setIsAdjustmentModalOpen(false);
      setAdjustmentData({ type: 'interest', amount: '', walletId: '' });
    } catch (err: any) {
      alert('Gagal melakukan penyesuaian: ' + err.message);
    }
  };

  const openAddModal = () => {
    setEditingWallet(null);
    setFormData({ name: '', type: 'Bank', balance: '', targetBalance: '', color: 'bg-blue-500', accountNumber: '', accountHolder: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance.toString(),
      targetBalance: wallet.target_balance?.toString() || '',
      color: wallet.color,
      accountNumber: wallet.account_number || '',
      accountHolder: wallet.account_holder || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setWalletToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (walletToDelete) {
      try {
        await dbService.deleteWallet(walletToDelete);
        setWallets(wallets.filter(w => w.id !== walletToDelete));
        setIsDeleteModalOpen(false);
        setWalletToDelete(null);
      } catch (err: any) {
        alert('Gagal menghapus dompet: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const walletData = {
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance) || 0,
      target_balance: parseFloat(formData.targetBalance) || undefined,
      color: formData.color,
      account_number: formData.accountNumber,
      account_holder: formData.accountHolder,
    };

    try {
      if (editingWallet) {
        const updated = await dbService.updateWallet(editingWallet.id, walletData);
        setWallets(wallets.map(w => w.id === editingWallet.id ? updated : w));
      } else {
        const created = await dbService.createWallet(walletData);
        
        // Create initial balance transaction
        if (walletData.balance > 0) {
          await dbService.createTransaction({
            name: 'Saldo Awal',
            category: 'Initial Balance',
            amount: walletData.balance,
            date: new Date().toISOString().split('T')[0],
            wallet_id: created.id,
            type: 'income',
            note: `Saldo awal saat pembuatan dompet ${created.name}`
          });
        }
        
        setWallets([...wallets, created]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Gagal menyimpan dompet: ' + err.message);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'E-Wallet': return Smartphone;
      case 'Digital Bank':
      case 'Credit Card':
      case 'PayLater': return CreditCard;
      default: return WalletIcon;
    }
  };

  return (
    <PageLayout 
      title="Dompet" 
      description="Kelola semua rekening, e-wallet, dan kartu kamu."
      actions={
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1">
          <Button 
            variant="primary"
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="flex-1 sm:flex-none whitespace-nowrap"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="hidden sm:inline">Bunga/Biaya</span>
            <span className="sm:hidden">Adj</span>
          </Button>
          <Button 
            variant="primary"
            onClick={() => setIsTransferModalOpen(true)}
            className="flex-1 sm:flex-none whitespace-nowrap"
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Transfer</span>
            <span className="sm:hidden">Trf</span>
          </Button>
          <Button 
            variant="neon"
            onClick={openAddModal}
            className="flex-1 sm:flex-none whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Dompet</span>
            <span className="sm:hidden">Baru</span>
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-neon animate-spin mb-4" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Memuat data dompet...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white/60 font-bold mb-4">{error}</p>
          <Button variant="primary" onClick={fetchWallets}>Coba Lagi</Button>
        </div>
      ) : (
        <>
           {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Card className="p-6 sm:p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-neon/10 rounded-full blur-3xl group-hover:bg-neon/20 transition-all sm:opacity-0 sm:group-hover:opacity-100" />
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neon/10 rounded-2xl flex items-center justify-center">
              <WalletIcon className="text-neon w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <Button 
              variant="ghost"
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors"
            >
              {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>
          </div>
          <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-glow-neon">Total Kekayaan (Kalola Balance)</div>
          <div className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 tracking-tight">
            {showBalances ? `Rp ${totalBalance.toLocaleString()}` : 'Rp ••••••••'}
          </div>
          <div className="flex items-center gap-2 text-neon text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>+Rp 2.450.000 bulan ini</span>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 overflow-hidden min-w-0">
          <div className="w-full sm:w-48 h-48 sm:h-48 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 w-full">
            {wallets.map((w, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                <div className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0", w.color.split(' ')[0])} />
                <div className="min-w-0">
                  <div className="text-[8px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest truncate">{w.name}</div>
                  <div className="text-xs sm:text-sm font-black">
                    {((w.balance / totalBalance) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {wallets.map((w) => {
          const Icon = getIcon(w.type);
          const progress = w.target_balance ? (w.balance / w.target_balance) * 100 : 0;
          
          return (
            <Card key={w.id} className="p-5 sm:p-6 hover:border-neon/30 transition-all group relative flex flex-col active:scale-[0.98] sm:active:scale-100">
              <div className="absolute top-4 right-4 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedWallet(w);
                    setIsHistoryModalOpen(true);
                  }}
                  className="p-1.5 sm:p-2 min-w-0"
                  title="Riwayat Transaksi"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => openEditModal(w)}
                  className="p-1.5 sm:p-2 min-w-0"
                >
                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Button 
                  variant="danger"
                  size="sm"
                  onClick={() => openDeleteModal(w.id)}
                  className="p-1.5 sm:p-2 min-w-0"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", w.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-white/20 text-xs font-bold uppercase tracking-widest">{w.type}</span>
              </div>
              <div className="text-white/60 text-sm mb-1">{w.name}</div>
              <div className="text-2xl font-black mb-4">
                {showBalances ? `Rp ${w.balance.toLocaleString()}` : 'Rp ••••••••'}
              </div>

              {w.target_balance && (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20">Target Saldo</span>
                    <span className="text-neon">Rp {w.target_balance.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-neon transition-all duration-1000" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-auto">
                {(w.account_number || w.account_holder) && (
                  <div className="pt-4 border-t border-white/5 space-y-1">
                    {w.account_number && (
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
                        <span>No. Rekening</span>
                        <span className="text-white/60">{w.account_number}</span>
                      </div>
                    )}
                    {w.account_holder && (
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
                        <span>Pemegang</span>
                        <span className="text-white/60">{w.account_holder}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        
        <Button 
          variant="ghost"
          onClick={openAddModal}
          className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-neon/50 hover:bg-neon/5 transition-all group min-h-[180px]"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-neon group-hover:text-dark transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-white/40 font-bold group-hover:text-neon">Tambah Baru</span>
        </Button>
      </div>
      </>
      )}

      {/* Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Antar Dompet"
      >
        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="space-y-4">
            <Select 
              label="Dari Dompet"
              required
              value={transferData.fromId}
              onChange={(e) => setTransferData({ ...transferData, fromId: e.target.value })}
              options={[
                { label: 'Pilih Dompet Asal', value: '' },
                ...wallets.map(w => ({ label: `${w.name} (Rp ${w.balance.toLocaleString()})`, value: w.id }))
              ]}
            />

            <div className="flex justify-center">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white/20 rotate-90 md:rotate-0" />
              </div>
            </div>

            <Select 
              label="Ke Dompet"
              required
              value={transferData.toId}
              onChange={(e) => setTransferData({ ...transferData, toId: e.target.value })}
              options={[
                { label: 'Pilih Dompet Tujuan', value: '' },
                ...wallets.map(w => ({ label: w.name, value: w.id }))
              ]}
            />

            <Input 
              label="Jumlah Transfer"
              required
              type="number" 
              value={transferData.amount}
              onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
              placeholder="0"
            />
          </div>

          <Button 
            type="submit"
            variant="neon"
            className="w-full py-4"
          >
            Konfirmasi Transfer
          </Button>
        </form>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWallet ? 'Edit Dompet' : 'Tambah Dompet Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Nama Dompet"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Misal: BCA Utama, GoPay, dll"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Tipe"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={WALLET_TYPES.map(t => ({ label: t, value: t }))}
            />
            <Input 
              label="Saldo Saat Ini"
              required
              type="number" 
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0"
            />
          </div>

          <Input 
            label="Target Saldo (Opsional)"
            type="number" 
            value={formData.targetBalance}
            onChange={(e) => setFormData({ ...formData, targetBalance: e.target.value })}
            placeholder="Misal: 10000000"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="No. Rekening / ID"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="Misal: 123456789"
            />
            <Input 
              label="Nama Pemegang"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              placeholder="Nama lengkap"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-white/20 uppercase tracking-widest">Warna Tema</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <Button
                  key={c.name}
                  type="button"
                  variant="ghost"
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all p-0 min-w-0",
                    c.value.split(' ')[0], // Get the bg color class
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
            {editingWallet ? 'Simpan Perubahan' : 'Buat Dompet'}
          </Button>
        </form>
      </Modal>

      {/* Adjustment Modal (Interest/Fee) */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Bunga & Biaya Admin"
      >
        <form onSubmit={handleAdjustment} className="space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl">
            <Button 
              type="button"
              variant="ghost"
              onClick={() => setAdjustmentData({ ...adjustmentData, type: 'interest' })}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-black transition-all",
                adjustmentData.type === 'interest' ? "bg-green-500 text-white" : "text-white/40 hover:text-white"
              )}
            >
              Bunga (+)
            </Button>
            <Button 
              type="button"
              variant="ghost"
              onClick={() => setAdjustmentData({ ...adjustmentData, type: 'fee' })}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-black transition-all",
                adjustmentData.type === 'fee' ? "bg-red-500 text-white" : "text-white/40 hover:text-white"
              )}
            >
              Biaya (-)
            </Button>
          </div>

          <Select 
            label="Pilih Dompet"
            required
            value={adjustmentData.walletId}
            onChange={(e) => setAdjustmentData({ ...adjustmentData, walletId: e.target.value })}
            options={[
              { label: 'Pilih Dompet', value: '' },
              ...wallets.map(w => ({ label: w.name, value: w.id }))
            ]}
          />

          <Input 
            label="Jumlah (Rp)"
            required
            type="number" 
            value={adjustmentData.amount}
            onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: e.target.value })}
            placeholder="0"
          />

          <Button 
            type="submit"
            variant={adjustmentData.type === 'interest' ? 'neon' : 'danger'}
            className={cn(
              "w-full py-4",
              adjustmentData.type === 'interest' ? "bg-green-500" : "bg-red-500"
            )}
          >
            Simpan Penyesuaian
          </Button>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Riwayat Transaksi"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{selectedWallet?.name}</p>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
            {filteredHistory.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    t.type === 'income' ? "bg-green-500/10 text-green-500" : "bg-white/5 text-white/40"
                  )}>
                    {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{t.date}</div>
                  </div>
                </div>
                <div className={cn("font-black text-sm", t.type === 'income' ? "text-green-500" : "text-white")}>
                  {t.type === 'income' ? '+' : '-'}Rp {t.amount.toLocaleString()}
                </div>
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center py-12 text-white/20 font-bold">
                Belum ada transaksi untuk dompet ini.
              </div>
            )}
          </div>
          <Button 
            variant="primary"
            onClick={() => setIsHistoryModalOpen(false)}
            className="w-full"
          >
            Tutup
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Dompet?"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm mb-8">
            Tindakan ini tidak dapat dibatalkan. Semua data transaksi terkait dompet ini akan tetap ada namun tidak lagi terhubung.
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
